import { Map } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Unit } from '../actions/action';
import { DestroyActionType } from '../actions/destroy';
import { SpawnActionType } from '../actions/spawn';
import Constants from '../constants';

export interface UnitState {
    lastId: number | null;
    idMap: Map<number, Unit>;
}
export interface UnitStateRecord extends TypedRecord<UnitStateRecord>, UnitState {}

const defaultState = makeTypedFactory<UnitState, UnitStateRecord>({
    lastId: null,
    idMap: Map<number, Unit>()
});

export function unit(state: UnitStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case SpawnActionType.SPAWN_UNIT:
            const unit = {
                id: Constants.generateId(),
                color: action.payload.color || Constants.COLORS.TAN,
                src: action.payload.src,
                dst: action.payload.dst
            };

            return state.merge({
                lastId: unit.id,
                idMap: state.idMap.set(unit.id, unit)
            });
        case DestroyActionType.DESTROY_UNIT:
            return state.merge({
                idMap: state.idMap.remove(action.payload)
            });
        default:
            return state;
    }
}
