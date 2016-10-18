var config = require('../config.json')
var log = require('./logger')
var request = require('./request')
var upload = require('./uploader')
var cors = require('cors')
var express = require('express')
var bodyParser = require('body-parser')
var compress = require('compression')
var builder = require('./builder')

var isS3 = config.s3 && config.s3.bucket

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.send(200)
  } else {
    next()
  }
}

var app = express()
app.use(cors())
app.use(allowCrossDomain) // explicit header sets for cors
app.use(compress())
app.use(bodyParser.json())
app.use('/widgets', express.static('widgets'))
app.set('view engine', 'pug')
app.set('views', './templates')

// set base url
function getS3BaseURL () {
  return (config.s3.baseURL || 'https://s3.amazonaws.com/') + config.s3.bucket + '/'
}

function getLocalBaseURL () {
  return config.host + (config.port === 80 ? '' : ':' + config.port) + '/widgets/'
}

var base = isS3 ? getS3BaseURL() : getLocalBaseURL()

app.get('/iframe/:id', function (req, res) {
  res.render('iframe-form', { base: base, id: req.params.id })
})

app.get('/iframe-gallery/:id', (req, res) => {
  res.render('iframe-gallery', {base, id: req.params.id})
})

app.get('/preview.js', function (req, res) {
  try {
    var props = JSON.parse(req.query.props)
    props.preview = true
    builder.buildWidget(props, true)
    .then(function (code) {
      res.send(code)
    })
    .catch(function (err) { res.status(500).send(err.stack) })
  } catch (err) {
    res.status(400).send('Bad request')
  }
})

// create a form
app.post('/create', function (req, res) {
  log('Route /create: Forwarding form to the Ask service')
  log(req.body)

  // Inject base URL into form settings
  req.body.settings.baseUrl = base

  request(req)
    .post({
      uri: '/v1/form',
      body: req.body
    })
    .then(function (response) {
      log('Response received from the Ask service:')
      log(response)

      var extras = {}
      extras.id = response.id
      if (config.recaptcha && req.body.settings.recaptcha) {
        extras.recaptcha = config.recaptcha
      }

      return builder
        .buildWidget(Object.assign(req.body, extras), false)
        .then(code => Promise.all([
          upload(response.id, code, './templates/iframe-form.pug'),
          code
        ]))
        .then(results => {
          res.json({
            urls: results[0],
            data: response
          })
        })
        .catch(function (err) {
          console.log(err)
          log('Error saving form to the Ask service')
          log(err.message)
          res.status(400).send(err.message)
        })
    })
    .catch(function (err) {
      res.status(500).send(err.message)
    })
})

// publish a gallery
app.post('/gallery/:galleryId/publish', (req, res) => {
  log(`Route /gallery/${req.params.galleryId}/publish`)
  log(req.body)

  req.body.config.baseUrl = base

  request(req)
    .put({
      uri: `/v1/form_gallery/${req.params.galleryId}`,
      body: req.body
    })
    .then(function (response) {
      log('Response received from the Ask service:')
      log(response)

      return builder.buildGallery(req.body)
    })
    .then(build => Promise.all([
      upload(req.params.galleryId, build.code, './templates/iframe-gallery.pug'),
      build
    ])).then(results => {

      res.json({
        urls: results[0],
        build: results[1]
      })
    })
    .catch(function (err) {
      console.log(err)
      log('Error saving form to the Ask service')
      log(err.data.message)
      res.status(400).send(err.data.message)
    })
})

app.listen(config.port || 4444, function () {
  log('Running at port 4444')
  log('Ask service host: ' + config.askHost)
})
