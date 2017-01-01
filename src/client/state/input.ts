import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Coordinates } from '../actions/action';
import { MouseActionType } from '../actions/mouse';

interface InputState {
    clickPoint: Coordinates;
}
export interface InputStateRecord extends TypedRecord<InputStateRecord>, InputState {}

const defaultState = makeTypedFactory<InputState, InputStateRecord>({
    clickPoint: { x: 0, y: 0 }
});

export function input(state: InputStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case MouseActionType.SINGLE_CLICK:
            return state.merge({ clickPoint: action.payload });
        default:
            return state;
    }
}
