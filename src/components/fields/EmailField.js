import preact from 'preact'
const { h, Component } = preact

import AskField from '../AskField';

class EmailField extends AskField {

  constructor(props, context) {
    super(props, context)
    // extend the state from AskWidget
    this.state = Object.assign(
      this.state,
      {
        value: this.props.text || ''
      }
    )

    this.onBlur = this.onBlur.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  // Event listeners

  onKeyDown(e) {
    switch (e.keyCode) {
      case 13: // Enter
        this.validateAndSave();
      break
      default:
        this.setState({ value: e.target.value });
      break;
    }
  }

  onChange(e) {
    this.setState({ value: e.target.value });
  }

  onBlur() {
    this.validateAndSave();
  }

  // Compute styles for different field states
  getStyles() {
    return Object.assign({},
      styles.base,
      this.props.isValid ? styles.valid : styles.error,
      this.state.focused ? styles.focused : {},
      { backgroundColor: this.props.theme.inputBackground }
    );
  }

  validateAndSave(options) {
    this.validate();
    this.update(options);
  }

  // Interface methods

  validate() {

    let isValid = true, isCompleted = false;

    isCompleted = !!this.state.value.length;

    if (isCompleted && this.props.validateAs) {
      switch (this.props.validateAs) {
        case "email":
          var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))?$/;
          isValid = emailRegex.test(this.state.value);
        break;
      }
    }

    this.setState({ isValid: isValid, completed: isCompleted });

    return !!this.props.required ?  isValid && isCompleted : isValid;

  }

  getValue() {
    return { text: this.state.value.length ? this.state.value : '' };
  }

  render() {
    const { title, component, fieldNumber } = this.props

    return (
      <div>
        <input
          id={`${component}--${fieldNumber}`}
          type="text"
          style={this.getStyles()}
          placeholder={this.props.placeholder}
          defaultValue={this.state.value}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          maxLength={!!this.props.maxLength ? this.props.maxLength : false}
        />
        {
          !!this.props.maxLength ?
            <div style={ styles.remaining }>{ this.props.maxLength - this.state.value.length } chars remaining.</div>
          :
            null
        }
      </div>
    )
  }
}

const styles = {
  base: {
    display: 'block',
    fontSize: '14pt',
    color: 'black',
    padding: '10px',
    width: '100%',
    outline: 'none',
    resize: 'none',
    border: '1px solid #ccc',
    transition: 'border .5s',
    borderRadius: '4px'
  },
  focused: {
    //borderBottom: '2px solid #009688'
  },
  remaining: {
    color: '#999',
    fontSize: '10pt',
    padding: '0px',
    textAlign: 'right',
    width: '100%',
    marginTop: '5px',
  }
}

export default EmailField;
