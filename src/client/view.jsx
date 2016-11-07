import React from 'react';
import { connect } from 'react-redux';

import ShapeRenderer from './shape-renderer.jsx';
import { destroyShape } from './actions/draw.js';

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
        <ShapeRenderer canvas={this.state.canvas} />
      </div>
    );
  }

  onCanvasClick(e) {
    // determine the coordinates of the click
    const rect = this.refs.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // TODO: implement logic for seeing if a shape is clicked,
    // and then calling this.props.destroyShape(id)
  }
}

const mapDispatchToProps = (dispatch) => ({
  destroyShape: (id) => {
    dispatch(destroyShape(id));
  }
});

export default connect(mapDispatchToProps)(View);
