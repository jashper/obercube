import Immutable from 'immutable';

import Actions from '../actions.js';

function input(state = new Immutable.Map(), action) {
  switch (action.type) {
    case Actions.CLICK_CANVAS:
      return state.set('clickPoint', action.point);
    default:
      return state;
  }
}

export default input;
