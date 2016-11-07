import React from 'react';
import { connect } from 'react-redux';

class View extends React.Component {
  width: 500
  height: 500

  shouldComponentUpdate(nextProps, nextState) {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw each shape
    nextProps.shapes.forEach((shape) => {
      this.drawShape(shape, ctx);
    });

    // all the state + props are rendered by the canvas, not by this React component,
    // so no need for render() to get called -> don't return true
    return false;
  }

  render() {
    return (
      <div>
        <h2> This is a test canvas</h2>
        <canvas ref='canvas' id='canvas' width={this.width} height={this.height} />
      </div>
    );
  }

  // i.e. paths = [{x: 125, y: 125}, {x: 125, y: 45}, {x: 45, y: 125}]
  drawShape(shape, ctx) {
    const paths = shape.paths;

    ctx.beginPath();

    ctx.moveTo(paths[0].x, paths[0].y);
    for (let idx = 1; idx < paths.length; ++idx) {
      const p = paths[idx];
      ctx.lineTo(p.x, p.y);
    }

    ctx.fill();
  }
}

const mapStateToProps = (state) => {
  return {
    shapes: state.shapes
  };
};

export default connect(mapStateToProps)(View);
