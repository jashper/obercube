import Actions from '../actions.js';

export default {
  clickCanvas: (point) => ({
    type: Actions.CLICK_CANVAS,
    point: point
  })
};
