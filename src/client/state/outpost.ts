import { Map } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Outpost } from '../actions/action';
import { SpawnActionType } from '../actions/spawn';
import Constants from '../constants';

export interface OutpostState {
    lastId: number | null;
    idMap: Map<number, Outpost>;
}
export interface OutpostStateRecord extends TypedRecord<OutpostStateRecord>, OutpostState {}

const defaultState = makeTypedFactory<OutpostState, OutpostStateRecord>({
    lastId: null,
    idMap: Map<number, Outpost>()
});

export function outpost(state: OutpostStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case SpawnActionType.SPAWN_OUTPOST:
            const outpost = {
                id: Constants.generateId(),
                color: action.payload.color || Constants.COLORS.TAN,
                x: action.payload.src.x,
                y: action.payload.src.y
            };

            return state.merge({
                lastId: outpost.id,
                idMap: state.idMap.set(outpost.id, outpost)
            });
        default:
            return state;
    }
}
