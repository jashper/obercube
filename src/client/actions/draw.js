import Actions from '../actions.js';

export default {
  createShape: (id, paths) => ({
    type: Actions.CREATE_SHAPE,
    id: id,
    shape: {
      paths: paths
    }
  }),

  destroyShape: (id) => ({
    type: Actions.DESTROY_SHAPE,
    id: id
  })
};
