import Actions from '../actions.js';

export default {
  createShape: (id, paths) => {
    return {
      type: Actions.CREATE_SHAPE,
      id: id,
      shape: {
        paths: paths
      }
    };
  },

  destroyShape: (id) => {
    return {
      type: Actions.DESTROY_SHAPE,
      id: id
    };
  }
};
