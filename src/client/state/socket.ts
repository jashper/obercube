import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';

import { Action } from '../../action';
import { SocketActionType } from '../actions/socket';

export interface SocketState {
    isOpen: boolean;
}
export interface SocketStateRecord extends TypedRecord<SocketStateRecord>, SocketState {}

const defaultState = makeTypedFactory<SocketState, SocketStateRecord>({
    isOpen: false
});

export function socket(state: SocketStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case SocketActionType.SOCKET_OPEN:
            return state.merge({ isOpen: true});
        default:
            return state;
    }
}
