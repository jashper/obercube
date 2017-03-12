import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action } from '../../action';
import { WindowActionType } from '../actions/window';

interface ViewportState {
    width: number;
    height: number;
}
export interface ViewportStateRecord extends TypedRecord<ViewportStateRecord>, ViewportState {}

export const defaultState = makeTypedFactory<ViewportState, ViewportStateRecord>({
    width: 0,
    height: 0
});

export function viewport(state: ViewportStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case WindowActionType.WINDOW_RESIZE:
            const width = action.payload.width;
            const height = action.payload.height;

            return state.merge({ width, height });
        default:
            return state;
    }
}
