import { combineReducers, Store } from 'redux';

import { game, GameStateRecord } from './game';
import { viewport, ViewportStateRecord } from './viewport';
import { socket, SocketStateRecord } from './socket';

export const reducers = combineReducers<StoreRecords>({
    game,
    socket,
    viewport
});

export interface StoreRecords {
    game: GameStateRecord;
    socket: SocketStateRecord;
    viewport: ViewportStateRecord;
}

export interface ClientStore extends Store<StoreRecords> {}
