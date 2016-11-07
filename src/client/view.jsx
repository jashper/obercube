import React from 'react';
import { connect } from 'react-redux';

import InputController from './input-controller.jsx';
import ShapeRenderer from './shape-renderer.jsx';
import Mouse from './actions/mouse.js';

class View extends React.Component {
  width: 500
  height: 500

  constructor(props) {
    super(props);

    this.state = {
      canvas: null
    };
  }

  componentDidMount() {
    this.setState({
      canvas: this.refs.canvas
    });
  }

  render() {
    return (
      <div>
        <h2> This is a test canvas</h2>
        <canvas ref='canvas' id='canvas'
                width={this.width} height={this.height}
                onClick={e => this.onCanvasClick(e)} />
        <InputController />
        <ShapeRenderer canvas={this.state.canvas} />
      </div>
    );
  }

  onCanvasClick(e) {
    // determine the coordinates of the click
    const rect = this.refs.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.props.dispatch(Mouse.clickCanvas({
      x: x,
      y: y
    }));
  }
}

export default connect()(View);
