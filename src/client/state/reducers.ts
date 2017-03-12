import { combineReducers, Store } from 'redux';

import { game, GameStateRecord } from './game';
import { viewport, ViewportStateRecord } from './viewport';
import { websocket, WebSocketStateRecord } from './web-socket';

export const reducers = combineReducers<StoreRecords>({
    game,
    viewport,
    websocket
});

export interface StoreRecords {
    game: GameStateRecord;
    viewport: ViewportStateRecord;
    websocket: WebSocketStateRecord;
}

export interface ClientStore extends Store<StoreRecords> {}
