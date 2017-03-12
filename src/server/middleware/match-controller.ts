import { createStore, combineReducers, Store } from 'redux';
import * as logger from 'winston';

import { Middleware, Player } from '../../action';
import { clients } from '../server';
import { game, GameStateRecord } from '../../client/state/game';
import { MatchAction, MatchActionType } from '../actions/match';
import { UserActionType } from '../actions/user';
import { SpawnActionType } from '../../client/actions/spawn';
import { ServerStore } from '../state/reducers';

interface GameRecord { game: GameStateRecord; }

const stores = new Map<number, Store<GameRecord>>();
let playerId = 0; // TODO: <--- remove

export const matchController: Middleware<ServerStore> = store => next => action => {
    logger.info(action.type); // TODO: <--- remove
    const result = next(action);

    switch (action.type) {
        case MatchActionType.NEW_MATCH:
        {
            const matchId = action.payload.id;
            const gameStore = createStore<GameRecord>(combineReducers<GameRecord>({ game }));

            gameStore.dispatch(action);
            stores.set(matchId, gameStore);

            return result;
        }
        case UserActionType.JOIN_MATCH:
        {
            const userId = action.payload.userId;
            const matchId = action.payload.matchId;

            const player: Player = {
                id: (++playerId <= 8) ? playerId : 1
            };

            const gameStore = stores.get(matchId)!;
            const gameAction = MatchAction.newPlayer(player);
            gameStore.dispatch(gameAction);

            const gameState = gameStore.getState().game;

            // TODO: only send to clients in the match
            clients.forEach((c) => {
                if (c.id === userId) {
                    c.sink.next(MatchAction.state(player.id, gameState));
                } else {
                    c.sink.next(gameAction);
                }
            });

            return result;
        }
        case SpawnActionType.SPAWN_UNIT:
        {
            const userId = action.userId!;
            const matchId = store.getState().user.active.get(userId)!.activeMatchId!;
            const gameStore = stores.get(matchId)!;

            // TODO: uncomment this dispatch after we implement cleaning up upon unit destruction
            // gameStore.dispatch(action);

            // TODO: only send to clients in the match
            clients.forEach((c) => {
                if (c.id !== userId) {
                    c.sink.next(action);
                }
            });

            return result;
        }
        default:
            return result;
    }
};
