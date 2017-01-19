import { combineReducers } from 'redux';

import { map, MapStateRecord } from './map';
import { viewport, ViewportStateRecord } from './viewport';

// All files in 'src/client/state/' must be included here
export const reducers = combineReducers({
    map,
    viewport
});

export interface StoreRecords {
    map: MapStateRecord;
    viewport: ViewportStateRecord;
}
