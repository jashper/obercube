import { combineReducers } from 'redux';

import input from './input.js';
import shapes from './shapes.js';

// All files in 'src/client/state/' must be included here
export default combineReducers({
  input: input,
  shapes: shapes
});
