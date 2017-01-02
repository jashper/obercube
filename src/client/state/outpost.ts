import { Map, Set } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, DrawableState, Outpost } from '../actions/action';
import { RenderActionType } from '../actions/render';
import { SpawnActionType } from '../actions/spawn';
import Constants from '../constants';

export interface OutpostState {
    toRender: Set<number>;
    idMap: Map<number, Outpost>;
}
export interface OutpostStateRecord extends TypedRecord<OutpostStateRecord>, OutpostState {}

const defaultState = makeTypedFactory<OutpostState, OutpostStateRecord>({
    toRender: Set<number>(),
    idMap: Map<number, Outpost>()
});

let id = 1;

export function outpost(state: OutpostStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case SpawnActionType.SPAWN_OUTPOST:
            const outpost = {
                id: id++,
                x: action.payload.x,
                y: action.payload.y,
                state: DrawableState.SPAWNED,
                color: action.payload.color || Constants.COLORS.TAN
            };

            return state.merge({
                toRender: state.toRender.add(outpost.id),
                idMap: state.idMap.set(outpost.id, outpost)
            });
        case RenderActionType.RENDER_OUTPOSTS:
            return state.merge({
                toRender: state.toRender.clear()
            });
        default:
            return state;
    }
}
