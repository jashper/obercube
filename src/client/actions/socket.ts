import { Action } from '../../action';

export const SocketActionType = {
    SOCKET_OPEN: 'SOCKET_OPEN'
};

export const SocketAction = {
    open: (socket: WebSocket): Action<WebSocket> => {
        return {
            type: SocketActionType.SOCKET_OPEN,
            payload: socket
        };
    }
};
