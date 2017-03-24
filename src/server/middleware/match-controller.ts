import { createStore, combineReducers, Store } from 'redux';
import { Subject } from 'rxjs/Subject';
import * as logger from 'winston';

import { Action, Middleware, Player } from '../../action';
import Constants from '../../constants';
import { GameTickEngine } from '../../game-tick-engine';
import { clients } from '../server';
import { game, GameStateRecord } from '../../client/state/game';
import { MatchAction, MatchActionType } from '../actions/match';
import { GameTickAction, GameTickActionType } from '../actions/game-tick';
import { UserActionType } from '../actions/user';
import { DestroyAction } from '../../client/actions/destroy';
import { SpawnActionType } from '../../client/actions/spawn';
import { UnitElementInfo } from '../../client/view/unit-element-info';
import { ServerStore } from '../state/reducers';

interface GameRecord { game: GameStateRecord; }

interface MatchInfo {
    store: Store<GameRecord>;
    engine: GameTickEngine;
    publisher: Subject<Action<any>>;
}

const matches = new Map<number, MatchInfo>();

// white-list of queued actions to publish to all clients in a match;
// otherwise they get dispatched to the game's store
const publishActions: Object = {
    SYNCHRONIZE_TICK: GameTickActionType.SYNCHRONIZE_TICK
};

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

            const engine = new GameTickEngine();
            engine.start(Constants.GAME_TICK_DELTA - 2); // the server needs to run slightly faster for the client to not be too far ahead

            const publisher = new Subject();
            engine.src.subscribe(a => {
                if (publishActions.hasOwnProperty(a.type)) {
                    publisher.next(a);
                }

                gameStore.dispatch(a);
            });

            engine.queueEvent({
                trigger: engine.getTick(),
                interval: 65, // ~ every 1 sec -- given the engine's period
                action: (tick: number) => GameTickAction.synchronize(tick)
            });

            matches.set(matchId, {
                store: gameStore,
                engine,
                publisher
            });

            return result;
        }
        case UserActionType.JOIN_MATCH:
        {
            const userId = action.payload.userId;
            const matchId = action.payload.matchId;
            const match = matches.get(matchId)!;

            const player: Player = {
                id: (++playerId <= 8) ? playerId : 1
            };

            const gameAction = MatchAction.newPlayer(player);
            match.store.dispatch(gameAction);
            match.publisher.next(gameAction);

            // send game state to the new player
            const client = clients.get(userId)!;
            const gameState = match.store.getState().game;
            client.send(GameTickAction.start(match.engine.getTick() + 10)); // TODO: remove this constant
            client.send(MatchAction.state(player.id, gameState));

            // subscribe the new player to all future game actions
            client.subscribe(match.publisher.asObservable());

            return result;
        }
        case SpawnActionType.SPAWN_UNIT:
        {
            const userId = action.userId!;
            const matchId = store.getState().user.active.get(userId)!.activeMatchId!;
            const match = matches.get(matchId)!;

            // TODO: verify that this is a valid action for the requesting player

            // TODO: generalize injecting ticks / removing sensitive properties like userId
            const tick = match.engine.getTick();
            action.payload.startTick = tick;
            action.payload.endTick = UnitElementInfo.GET_END_TICK(action.payload, match.store.getState().game, tick);
            delete action.userId;

            match.store.dispatch(action);
            match.engine.queueEvent({
                trigger: action.payload.endTick,
                interval: 0,
                action: () => DestroyAction.unit(action.payload.id)
            });

            match.publisher.next(action);

            return result;
        }
        default:
            return result;
    }
};
