import React from 'react';

import ShapeRenderer from './shape-renderer.jsx';

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
        <canvas ref='canvas' id='canvas' width={this.width} height={this.height} />
        <ShapeRenderer canvas={this.state.canvas} />
      </div>
    );
  }
}

export default View;
