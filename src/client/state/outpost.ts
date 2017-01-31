import { Map } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Outpost } from '../actions/action';
import { SpawnActionType } from '../actions/spawn';
import Constants from '../constants';
import { OutpostElement } from '../view/outpost-element';

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
            const id = Constants.generateId();
            const outpost = OutpostElement.GENERATE_DRAWABLE(id, action.payload);

            return state.merge({
                lastId: id,
                idMap: state.idMap.set(id, outpost)
            });
        default:
            return state;
    }
}
