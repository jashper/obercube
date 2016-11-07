import Immutable from 'immutable';

import Actions from '../actions.js';

function shapes(state = new Immutable.Map(), action) {
  switch (action.type) {
    case Actions.CREATE_SHAPE:
      return state.set(action.id, action.shape);
    case Actions.DESTROY_SHAPE:
      return state.delete(action.id);
    default:
      return state;
  }
}

export default shapes;
