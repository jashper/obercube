import { OrderedMap } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Unit } from '../actions/action';
import { DestroyActionType } from '../actions/destroy';
import { SpawnActionType } from '../actions/spawn';
import Constants from '../constants';
import { UnitElement } from '../view/unit-element';

export interface UnitState {
    idMap: OrderedMap<number, Unit>;
}
export interface UnitStateRecord extends TypedRecord<UnitStateRecord>, UnitState {}

const defaultState = makeTypedFactory<UnitState, UnitStateRecord>({
    idMap: OrderedMap<number, Unit>()
});

export function unit(state: UnitStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case SpawnActionType.SPAWN_UNIT:
            const id = Constants.generateId();
            const unit = UnitElement.GENERATE_DRAWABLE(id, action.payload);

            return state.merge({
                idMap: state.idMap.set(id, unit)
            });
        case DestroyActionType.DESTROY_UNIT:
            return state.merge({
                idMap: state.idMap.remove(action.payload)
            });
        default:
            return state;
    }
}
