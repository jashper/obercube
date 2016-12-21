import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action } from '../actions/action';
import { MouseActionType, Coordinates } from '../actions/mouse';

interface InputState {
    clickPoint: Coordinates;
}
export interface InputStateRecord extends TypedRecord<InputStateRecord>, InputState {}

const defaultState = makeTypedFactory<InputState, InputStateRecord>({
    clickPoint: new Coordinates(0, 0)
});

export function input(state: InputStateRecord = defaultState(), action: Action<Coordinates>) {
    switch (action.type) {
        case MouseActionType.SINGLE_CLICK:
            return state.merge({clickPoint: action.payload});
        default:
            return state;
    }
}
