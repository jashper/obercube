import { combineReducers, createStore, Middleware, Store } from 'redux';
import { Subject } from 'rxjs';
import * as logger from 'winston';

import { Action, Player, Unit } from '../../action';
import { DestroyAction } from '../../client/actions/destroy';
import { SpawnActionType } from '../../client/actions/spawn';
import { game, GameStateRecord } from '../../client/state/game';
import { UnitElementInfo } from '../../client/view/unit-element-info';
import Constants from '../../constants';
import { GameTickEngine } from '../../game-tick-engine';
import { GameTickAction, GameTickActionType } from '../actions/game-tick';
import { GenerateAction, GenerateActionType } from '../actions/generate';
import { MatchAction, MatchActionType, MatchSetup } from '../actions/match';
import { JoinMatchInfo, UserActionType } from '../actions/user';
import { clients } from '../server';
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
    SYNCHRONIZE_TICK: GameTickActionType.SYNCHRONIZE_TICK,
    GENERATE_UNITS: GenerateActionType.GENERATE_UNITS
};

let playerId = 0; // TODO: <--- remove

export const matchController: Middleware<{}, ServerStore> = store => next => action => {
    logger.info(action.type); // TODO: <--- remove
    const result = next(action);

    switch (action.type) {
        case MatchActionType.NEW_MATCH:
        {
            const matchId = (action.payload as MatchSetup).id;
            const gameStore = createStore<GameRecord, Action<any>, {}, {}>(combineReducers<GameRecord>({ game }));

            gameStore.dispatch(action);

            // the server needs to run slightly faster for the client to not be too far ahead
            const engine = new GameTickEngine();
            engine.start(0, Constants.GAME_TICK_DELTA - 2);

            const publisher = new Subject<Action<any>>();
            engine.src.subscribe(a => {
                if (publishActions.hasOwnProperty(a.type)) {
                    publisher.next(a);
                }

                gameStore.dispatch(a);
            });

            // queue up periodic events to be sent to all clients
            engine.queueEvent({
                trigger: engine.tick,
                interval: Constants.DeltaToTicks(5000), // ~ every 5 sec
                action: (tick: number) => GameTickAction.synchronize(tick)
            });

            engine.queueEvent({
                trigger: engine.tick,
                interval: Constants.DeltaToTicks(1000),
                action: () => GenerateAction.units()
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
            const info = action.payload as JoinMatchInfo;

            const userId = info.userId;
            const matchId = info.matchId;
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
            client.send(GameTickAction.start(match.engine.tick + 10)); // TODO: better sync this to account for latency
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
            const unit = action.payload as Unit;
            const tick = match.engine.tick;
            unit.startTick = tick;
            unit.endTick = UnitElementInfo.GET_END_TICK(unit, match.store.getState().game, tick);
            delete action.userId;

            match.store.dispatch(action);
            match.engine.queueEvent({
                trigger: unit.endTick,
                interval: 0,
                action: () => DestroyAction.unit(unit.id)
            });

            match.publisher.next(action);

            return result;
        }
        default:
            return result;
    }
};
