import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action } from '../../action';
import { SocketActionType } from '../actions/socket';
import { SpawnActionType } from '../actions/spawn';

export interface WebSocketState {
    isOpen: boolean;
}
export interface WebSocketStateRecord extends TypedRecord<WebSocketStateRecord>, WebSocketState {}

const defaultState = makeTypedFactory<WebSocketState, WebSocketStateRecord>({
    isOpen: false
});

let socket: WebSocket;

export function websocket(state: WebSocketStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case SocketActionType.SOCKET_OPEN:
            socket = action.payload;

            return state.merge({
                isOpen: true
            });
        default:
            sendClientAction(action);
            return state;
    }
}

// white-list of client actions to send to the server
const clientActions: Object = {
    ...SpawnActionType
};

function sendClientAction(action: Action<any>) {
    if (!clientActions.hasOwnProperty(action.type) || action.fromServer || socket.readyState > 1) {
        return;
    }

    const payload = JSON.stringify(action);
    socket.send(payload);
}
