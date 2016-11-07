import React from 'react';
import { connect } from 'react-redux';

import Draw from './actions/draw.js';

class InputController extends React.Component {
  componentDidUpdate(prevProps) {
    const input = this.props.input;
    const shapes = this.props.shapes;

    // only update if input has changed (i.e. ignore updates to the rest of mapStateToProps)
    const prevInput = prevProps.input;
    if (input.equals(prevInput)) {
      return;
    }

    const clickPoint = input.get('clickPoint');
    const prevClickPoint = prevInput.get('clickPoint');

    // has a click occured
    if (clickPoint !== prevClickPoint) {
      const { x, y } = clickPoint;

      // has a shape been clicked on
      shapes.forEach((shape, id) => {
        if (this.isPointInsideShape(x, y, shape)) {
          // destroy it if so
          this.props.dispatch(Draw.destroyShape(id));
          return;
        }
      });
    }
  }

  render() {
    return null;
  }

  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  isPointInsideShape(x, y, shape) {
    const paths = shape.paths;

    let isInside = false;
    for (let i = 0, j = paths.length - 1; i < paths.length; j = i++) {
      const xi = paths[i].x;
      const yi = paths[i].y;

      const xj = paths[j].x;
      const yj = paths[j].y;

      const intersect = ((yi > y) !== (yj > y))
          && (x < (((xj - xi) * (y - yi)) / (yj - yi)) + xi);

      if (intersect) {
        isInside = !isInside;
      }
    }

    return isInside;
  }
}

const mapStateToProps = (state) => ({
  input: state.input,
  shapes: state.shapes
});

export default connect(mapStateToProps)(InputController);
