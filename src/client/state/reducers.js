import { combineReducers } from 'redux';

import shapes from './shapes.js';

// All files in 'src/client/state/' must be included here
export default combineReducers({
  shapes: shapes
});
