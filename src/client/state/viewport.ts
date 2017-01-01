import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action } from '../actions/action';
import { WindowActionType } from '../actions/window';

interface ViewportState {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
}
export interface ViewportStateRecord extends TypedRecord<ViewportStateRecord>, ViewportState {}

const defaultState = makeTypedFactory<ViewportState, ViewportStateRecord>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
});

export function viewport(state: ViewportStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case WindowActionType.WINDOW_RESIZE:
            return state.merge({
                width: action.payload.width,
                height: action.payload.height
            });
        case WindowActionType.WINDOW_RESCALE:
            return state.merge({
                scale: action.payload
            });
        default:
            return state;
    }
}
