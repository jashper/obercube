import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Unit } from '../../action';
import { SocketActionType } from '../actions/socket';
import Constants from '../../constants';

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
    SPAWN_UNIT: 'SPAWN_UNIT'
};

function sendClientAction(action: Action<any>) {
    if (!clientActions.hasOwnProperty(action.type) || socket.readyState > 1) {
        return;
    }

    // if (action.type === 'SPAWN_UNIT' && (action.payload as Unit).playerId === Constants.playerId) {
    //     const payload = JSON.stringify(action);
    //     socket.send(payload);
    // }
}
