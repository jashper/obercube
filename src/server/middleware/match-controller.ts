import { createStore, combineReducers, Store } from 'redux';
import { Subject } from 'rxjs/Subject';
import * as logger from 'winston';

import { Action, Middleware, Player } from '../../action';
import Constants from '../../constants';
import { GameTickEngine }  from '../../game-tick-engine';
import { clients } from '../server';
import { game, GameStateRecord } from '../../client/state/game';
import { MatchAction, MatchActionType } from '../actions/match';
import { GameTickAction } from '../actions/game-tick';
import { UserActionType } from '../actions/user';
import { SpawnActionType } from '../../client/actions/spawn';
import { ServerStore } from '../state/reducers';

interface GameRecord { game: GameStateRecord; }

// TODO: condense these into one map (i.e. create a GameInfo interface)
const stores = new Map<number, Store<GameRecord>>();
const tickEngines = new Map<number, GameTickEngine>();
const publishers = new Map<number, Subject<Action<any>>>();

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
            publishers.set(matchId, new Subject());

            const engine = new GameTickEngine();
            engine.start(Constants.GAME_TICK_DELTA);
            tickEngines.set(matchId, engine);

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
            const pub = publishers.get(matchId)!;
            const engine = tickEngines.get(matchId)!;

            const gameAction = MatchAction.newPlayer(player);
            gameStore.dispatch(gameAction);
            pub.next(gameAction);

            // send game state to the new player
            const client = clients.get(userId)!;
            const gameState = gameStore.getState().game;
            client.send(GameTickAction.start(engine.getTick()));
            client.send(MatchAction.state(player.id, gameState));

            // subscribe the new player to all future game actions
            client.subscribe(pub.asObservable());

            return result;
        }
        case SpawnActionType.SPAWN_UNIT:
        {
            const userId = action.userId!;
            const matchId = store.getState().user.active.get(userId)!.activeMatchId!;
            const gameStore = stores.get(matchId)!;

            // TODO: verify that this is a valid action for the requesting player

            // TODO: uncomment this dispatch after we implement cleaning up upon unit destruction
            // gameStore.dispatch(action);

            // TODO: only send to clients in the match
            clients.forEach((c) => {
                if (c.id !== userId) {
                    c.send(action);
                }
            });

            return result;
        }
        default:
            return result;
    }
};
