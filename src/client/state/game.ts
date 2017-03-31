import { OrderedMap, Map } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

// TODO: make a typying file for this library
import * as transit from 'transit-immutable-js';
const fromJSON: (json: any) => any = transit.fromJSON;

import { Action, MapInfo, Outpost, Unit, Player } from '../../action';
import { DestroyActionType } from '../actions/destroy';
import { SpawnActionType } from '../actions/spawn';
import { GenerateActionType } from '../../server/actions/generate';
import { MatchActionType, MatchSetup } from '../../server/actions/match';

interface GameState {
    matchId: number;
    playerId: number;
    mapInfo: MapInfo;
    players: Map<number, Player>;
    outposts: OrderedMap<number, Outpost>;
    units: OrderedMap<number, Unit>;
}
export interface GameStateRecord extends TypedRecord<GameStateRecord>, GameState {}

export const defaultGameState = makeTypedFactory<GameState, GameStateRecord>({
    matchId: 0,
    playerId: 0,
    mapInfo: {
        width: 0,
        height: 0
    },
    players: Map<number, Player>(),
    outposts: OrderedMap<number, Outpost>(),
    units: OrderedMap<number, Unit>()
});

export function game(state: GameStateRecord = defaultGameState(), action: Action<any>) {
    switch (action.type) {
        case SpawnActionType.SPAWN_UNIT:
            const unit = action.payload as Unit;
            return state.merge({
                units: state.units.set(unit.id, unit)
            });
        case DestroyActionType.DESTROY_UNIT:
            return state.merge({
                units: state.units.remove(action.payload)
            });
        case GenerateActionType.GENERATE_UNITS:
            state.outposts.forEach((o: Outpost) => {
                o.unitCount = Math.min(o.unitCount + 1, 999);

                state = state.merge({
                    outposts: state.outposts.set(o.id, o)
                });
            });

            return state;
        case MatchActionType.NEW_PLAYER:
            const player = action.payload as Player;
            return state.merge({
                players: state.players.set(player.id, player)
            });
        case MatchActionType.NEW_MATCH: // for initializing server-based stores of game state
            const match = action.payload as MatchSetup;

            let game = defaultGameState();
            game = game.merge({
                matchId: match.id,
                mapInfo: match.mapInfo
            });

            (match.outposts as Outpost[]).forEach((o) => {
                game = game.merge({
                    outposts: game.outposts.set(o.id, o)
                });
            });

            return game;
        case MatchActionType.GAME_STATE:
            const record = fromJSON(action.payload);
            return makeTypedFactory<GameState, GameStateRecord>({
                matchId: record.matchId,
                playerId: record.playerId,
                mapInfo: record.mapInfo.toObject(),
                players: record.players,
                outposts: record.outposts,
                units: record.units
            })();
        default:
            return state;
    }
}
