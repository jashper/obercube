import Immutable from 'immutable';

import Actions from '../actions.js';

const defaultState = new Immutable.Map({
  clickPoint: {
    x: null,
    y: null
  }
});

function input(state = defaultState, action) {
  switch (action.type) {
    case Actions.CLICK_CANVAS:
      return state.set('clickPoint', action.point);
    default:
      return state;
  }
}

export default input;
