
var marked = require('marked')
var rollup = require('rollup')
var babel = require('rollup-plugin-babel')
var nodeResolve = require('rollup-plugin-node-resolve')
// var uglify = require('rollup-plugin-uglify')
var postcss = require('rollup-plugin-postcss')
var replace = require('rollup-plugin-replace')
var commonjs = require('rollup-plugin-commonjs')
var babelConf = require('./babel.json')
var log = require('./logger')
var config = require('../config.json')

marked.setOptions({ sanitize: true })
var renderer = new marked.Renderer()
renderer.link = ( href, title, text ) => `<a target="_blank" href="${ href }" title="${ title }">${ text }</a>`

var defaultBundle
createFormBundle().then(function (bundle) {
  defaultBundle = bundle
}).catch(err => console.log(err))

var defaultGalleryBundle
createGalleryBundle().then(bundle => {
  defaultGalleryBundle = bundle
}).catch(error => {
  console.log('fucked!')
  console.error(error.stack)
})

function getDefaultBundle () {
  return new Promise(function (resolve, reject) { resolve(defaultBundle) })
}

function getDefaultGalleryBundle () {
  return new Promise(function (resolve, reject) {
    console.log('default gallery built')
    resolve(defaultGalleryBundle)
  })
}

function createFormBundle (props) {
  return rollup.rollup({
    entry: 'form-entry.js',
    plugins: [
      replace({
        __WIDGETS__: props ? `{ ${[...new Set(props.steps[0].widgets.map(widget => widget.component))].join(', ')} }` : 'types'
      }),
      postcss(),
      babel(Object.assign({exclude: 'node_modules/**', babelrc: false}, babelConf)),
      nodeResolve({jsnext: true, main: true}),
      commonjs({})/*,
      isPreview && uglify({mangle: true})*/
    ]
  })
}

function createGalleryBundle (props) {
  return rollup.rollup({
    entry: 'gallery-entry.js',
    plugins: [
      // replace({})
      // postcss(),
      babel(Object.assign({exclude: 'node_modules/**', babelrc: false}, babelConf)),
      nodeResolve({jsnext: true, main: true}),
      commonjs({})
    ]
  })
}

module.exports = {
  buildWidget: function (props, isPreview) {
    log('Route /buildWidget: isPreview:' + isPreview + " : " + props.id)

    // convert policy from markdown
    props.footer.conditions = marked(props.footer.conditions, { renderer: renderer })

    return new Promise(function (resolve, reject) {
      log('Starting rollup: ' + props.id)
      var getBundle = isPreview || !config.minimalWidgets ? getDefaultBundle : createFormBundle
      getBundle(props)
      .then(function (bundle) {
        log('Built bundle: ' + props.id)
        
        var result = bundle.generate({
          intro: 'var props = ' + JSON.stringify(props) + ', renderTarget = "' + (props.target || '#ask-form') + '"',
          format: 'iife'
        })
        resolve(result.code)
      }).catch(reject)
    })
  },

  buildGallery: function (galleryProps) {
    // return getDefaultGalleryBundle().then(bundle => {
    return createGalleryBundle().then(bundle => {
      return bundle.generate({
        intro: `var props = ${JSON.stringify(galleryProps)}; var renderTarget = "${galleryProps.target || '#ask-gallery'}"`,
        format: 'iife'
      })
    })
  }
}
