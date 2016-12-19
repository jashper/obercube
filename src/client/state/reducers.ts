import { combineReducers } from 'redux';

import { input, InputStateRecord } from './input';

// All files in 'src/client/state/' must be included here
export const reducers = combineReducers({
	input
});

export interface StoreRecords {
	input: InputStateRecord
}