import preact from 'preact'
const { h, Component } = preact

class InfoIcon extends Component {
  render () {
    return (
      <svg width='20' height='20' x='0px' y='10px' viewBox='0 0 60 60'>
        <rect x='-14' y='-13' display='none' fill='#000000' width='198' height='87' /><path d='M29.999,5.001C16.193,5.001,5,16.195,5,30.001c0,13.808,11.193,24.998,24.999,24.998C43.806,54.999,55,43.809,55,30.001  C55,16.195,43.806,5.001,29.999,5.001z M29.419,13.203c2.414,0,4.371,1.957,4.371,4.371c0,2.414-1.957,4.371-4.371,4.371  c-2.414,0-4.371-1.957-4.371-4.371C25.048,15.16,27.005,13.203,29.419,13.203z M37.256,44.211H23.243v-1.007  c0.93-0.168,1.591-0.311,1.984-0.435c0.393-0.124,0.726-0.295,1.001-0.514c0.273-0.216,0.489-0.555,0.642-1.007  c0.153-0.452,0.235-1.16,0.235-2.122v-8.971c0-0.878-0.026-1.584-0.073-2.119c-0.047-0.535-0.213-0.964-0.499-1.286  c-0.286-0.322-0.723-0.562-1.306-0.72c-0.585-0.157-1.412-0.291-2.485-0.4v-1.092l8.328-0.186h2.181v14.714  c0,1.178,0.094,1.999,0.286,2.459c0.19,0.461,0.555,0.809,1.091,1.05c0.536,0.239,1.411,0.448,2.627,0.628V44.211z' />
      </svg>
    )
  }
}

export default InfoIcon
