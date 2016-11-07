import React from 'react';
import { connect } from 'react-redux';

class ShapeRenderer extends React.Component {
  componentDidUpdate() {
    const canvas = this.props.canvas;
    const shapes = this.props.shapes;

    // clear the canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw each shape
    shapes.forEach((shape) => {
      this.drawShape(shape, ctx);
    });
  }

  render() {
    return null;
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

// Only update on changes to state.shapes -> injects state.shapes as this.props.shapes
const mapStateToProps = (state) => ({
  shapes: state.shapes
});

export default connect(mapStateToProps)(ShapeRenderer);
