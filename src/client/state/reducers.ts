import { Action, Dispatch } from '../actions/action';
import { map, MapStateRecord } from './map';
import { outpost, OutpostStateRecord } from './outpost';
import { viewport, ViewportStateRecord, defaultViewportState } from './viewport';

// Dispatch can only be used in an aync manner (i.e. don't call it directly in a reducer, schedule it instead)
export const reducers = (state: any = {}, action: Action<any>, dispatch: Dispatch) => {
    // all files in 'src/client/state/' must be included here
    const newState = {
        map: map(state.map, action),
        outpost: outpost(state.outpost, action),
        viewport: state.viewport || defaultViewportState()
    };

    // ensure that all updates happen before the viewport state is updated
    newState.viewport = viewport(newState, action, dispatch);

    return newState;
};

export interface StoreRecords {
    map: MapStateRecord;
    outpost: OutpostStateRecord;
    viewport: ViewportStateRecord;
}
