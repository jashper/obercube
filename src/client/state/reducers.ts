import { Action, Dispatch } from '../actions/action';
import { map, MapStateRecord } from './map';
import { viewport, ViewportStateRecord } from './viewport';

// All files in 'src/client/state/' must be included here
// Dispatch can only be used in an aync manner (i.e. don't call it directly in a reducer, schedule it instead)
export const reducers = (state: any = {}, action: Action<any>, dispatch: Dispatch) => {
    return {
        map: map(state.map, action),
        viewport: viewport(state.viewport, action, dispatch)
    };
};

export interface StoreRecords {
    map: MapStateRecord;
    viewport: ViewportStateRecord;
}
