import { combineReducers } from 'redux';

import { game, GameStateRecord } from './game';
import { socket, SocketStateRecord } from './socket';
import { viewport, ViewportStateRecord } from './viewport';

export const reducers = combineReducers<ClientStore>({
    game,
    socket,
    viewport
});

export interface ClientStore {
    game: GameStateRecord;
    socket: SocketStateRecord;
    viewport: ViewportStateRecord;
}
