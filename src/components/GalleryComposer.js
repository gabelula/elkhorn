import preact from 'preact'
const {h, Component} = preact

export default class GalleryComposer extends Component {

  renderAnswers () {
    const {answers} = this.props
    let theme = this.getTheme()
    return answers.map(a => {
      // is this answer multiple choice?

      let answerBody
      const possibleDate = new Date(a.answer.answer.value)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      if (Object.prototype.toString.call(possibleDate) === '[object Date]' && !isNaN(possibleDate)) {
        const formatted = `${possibleDate.getDate()} ${months[possibleDate.getMonth()]}. ${possibleDate.getFullYear()}`
        answerBody = <span className='askGallery__answerText'>{formatted}</span>
      } else if (Array.isArray(a.answer.answer.options)) {
        answerBody = a.answer.answer.options.map(option => {
          return <div className='askGallery__answerMultiOption'>{option.title}</div>
        })
      } else { // a regular text response
        const text = a.answer.edited ? a.answer.edited : a.answer.answer.text
        answerBody = <span className='askGallery__answerText'>{text}</span>
      }

      return (
        <div
          className='askGallery__answer'
          style={theme.askGalleryAnswer}>
          {
            this.props.config.placement === 'above'
            ? this.renderIdentityInfo(a, 'above')
            : null
          }
          {answerBody}
          {
            this.props.config.placement === 'below'
            ? this.renderIdentityInfo(a, 'below')
            : null
          }
        </div>
      )
    })
  }

  renderIdentityInfo (answer, placement) {
    console.log('renderIdentityInfo', this.props)
    let theme = this.getTheme()
    return answer.identity_answers && this.props.config.identifiableIds.length
    ? <p
      className={`askGallery__pii askGallery__pii-${placement}`}
      style={theme.askGalleryPii}>
      {answer.identity_answers.map(idAnswer => {
        const displayable = this.props.config.identifiableIds.indexOf(idAnswer.widget_id) !== -1
        if (!displayable) {
          return ''
        } else {
          return idAnswer.edited ? idAnswer.edited : idAnswer.answer.text
        }
      }).join(' ')}
    </p>
    : null
  }

  getTheme() {
    return this.props.theme || defaultTheme;
  }

  render () {
    console.log('render elkhorn', this.props)
    let theme = this.getTheme()
    return (
      <div
        className='askGallery'
        style={theme.base}>
        <div
          className='askGallery__header'
          style={theme.askGalleryHeader}>
        {
          this.props.headline
          ? <h1
              className='askGallery__title'
              style={theme.askGalleryTitle}>
                {this.props.headline}
            </h1>
          : null
        }
        {
          this.props.description
          ? <h4
            className='askGallery__description'
            style={theme.askGalleryDescription}>{this.props.description}</h4>
          : null
        }
        </div>
        <div
          className='askGallery__answers'
          style={theme.askGalleryAnswers}>
          {this.renderAnswers()}
        </div>
      </div>
    )
  }
}

//Adding a stub defaultTheme in case one is wanted later.
const defaultTheme = {
  base:{
    display:'relative'
  },
  askGalleryTitle: {
    margin: '0 auto',
    fontSize: '24px',
    lineHeight: '28px',
    marginBottom: '5px'
  },
  askGalleryDescription: {
    margin: '0 auto',
    lineHeight: '24px',
    fontSize: '20px',
    fontWeight: 400,
    color: '#444'
  },
  askGalleryHeader:{
    padding: '20px 40px 10px',
    fontSize: '24px'
  },
  askGalleryAnswers:{
    padding: '10px 40px'
  },
  askGalleryAnswer:{
    marginBottom:'20px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd'
  },
  askGalleryPii:{
    fontStyle:'italic',
    fontSize:'12pt',
    fontColor:'#808080'
  }
}
