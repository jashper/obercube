import { combineReducers } from 'redux';

import { input, InputStateRecord } from './input';
import { map, MapStateRecord } from './map';
import { outpost, OutpostStateRecord } from './outpost';
import { viewport, ViewportStateRecord } from './viewport';

// All files in 'src/client/state/' must be included here
export const reducers = combineReducers({
    input,
    map,
    outpost,
    viewport
});

export interface StoreRecords {
    input: InputStateRecord;
    map: MapStateRecord;
    outpost: OutpostStateRecord;
    viewport: ViewportStateRecord;
}
