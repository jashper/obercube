import { combineReducers } from 'redux';

import { input, InputStateRecord } from './input';
import { map, MapStateRecord } from './map';
import { viewport, ViewportStateRecord } from './viewport';

// All files in 'src/client/state/' must be included here
export const reducers = combineReducers({
    input,
    map,
    viewport
});

export interface StoreRecords {
    input: InputStateRecord;
    map: MapStateRecord;
    viewport: ViewportStateRecord;
}
