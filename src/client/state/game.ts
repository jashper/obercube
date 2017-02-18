import { OrderedMap } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

// TODO: make a typying file for this library
import * as transit from 'transit-immutable-js';
const fromJSON: (json: any) => any = transit.fromJSON;

import { Action, MapInfo, Outpost, Unit } from '../../action';
import { DestroyActionType } from '../actions/destroy';
import { SpawnActionType } from '../actions/spawn';
import { MatchActionType } from '../../server/actions/match';

interface GameState {
    mapInfo: MapInfo;
    outposts: OrderedMap<number, Outpost>;
    units: OrderedMap<number, Unit>;
}
export interface GameStateRecord extends TypedRecord<GameStateRecord>, GameState {}

export const defaultGameState = makeTypedFactory<GameState, GameStateRecord>({
    mapInfo: {
        width: 0,
        height: 0
    },
    outposts: OrderedMap<number, Outpost>(),
    units: OrderedMap<number, Unit>()
});

export function game(state: GameStateRecord = defaultGameState(), action: Action<any>) {
    switch (action.type) {
        case SpawnActionType.SPAWN_UNIT:
            const unit: Unit = action.payload;
            return state.merge({
                units: state.units.set(unit.id, unit)
            });
        case DestroyActionType.DESTROY_UNIT:
            return state.merge({
                units: state.units.remove(action.payload)
            });
        case MatchActionType.GAME_STATE:
            const record = fromJSON(action.payload);
            return makeTypedFactory<GameState, GameStateRecord>({
                mapInfo: record.mapInfo.toObject(),
                outposts: record.outposts,
                units: record.units
            })();
        default:
            return state;
    }
}
