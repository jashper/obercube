import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action } from '../actions/action';
import { MatchActionType } from '../actions/match';

interface MapState {
    width: number;
    height: number;
}
export interface MapStateRecord extends TypedRecord<MapStateRecord>, MapState {}

const defaultState = makeTypedFactory<MapState, MapStateRecord>({
    width: 0,
    height: 0
});

export function map(state: MapStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case MatchActionType.NEW_MATCH:
            return state.merge({
                width: action.payload.mapWidth,
                height: action.payload.mapHeight
            });
        default:
            return state;
    }
}
