import { Action, Middleware } from '../../action';
import { SocketActionType } from '../actions/socket';
import { SpawnActionType } from '../actions/spawn';
import { ClientStore } from '../state/reducers';

let socket: WebSocket;

export const webSocketController: Middleware<ClientStore> = store => next => action => {
    const result = next(action);

    switch (action.type) {
        case SocketActionType.SOCKET_OPEN:
            socket = action.payload;
            return result;
        default:
            sendClientAction(action);
            return result;
    }
};

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
