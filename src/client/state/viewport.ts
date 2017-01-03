import * as Immutable from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, DrawableState, Outpost } from '../actions/action';
import { MatchActionType } from '../actions/match';
import { SpawnActionType } from '../actions/spawn';
import { WindowActionType } from '../actions/window';
import { ViewElementGrid, ViewElement, ElementVisibility } from '../view/view-element-grid';
import { OutpostElement } from '../view/outpost-element';
import Constants from '../constants';

interface ViewportState {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    outposts: Immutable.Map<number, Outpost>;
}
export interface ViewportStateRecord extends TypedRecord<ViewportStateRecord>, ViewportState {}

const defaultState = makeTypedFactory<ViewportState, ViewportStateRecord>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
    outposts: Immutable.Map<number, Outpost>()
});

let stage: PIXI.Container;
let mapWidth: number;
let mapHeight: number;

const viewElements = new Map<number, ViewElement>();
const activeElements = new Set<number>();
const grid = new ViewElementGrid(100);

let prevId = 0;

export function viewport(state: ViewportStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case MatchActionType.NEW_MATCH:
            mapWidth = action.payload.mapWidth;
            mapHeight = action.payload.mapHeight;
            return state;

        case WindowActionType.WINDOW_RESIZE:
            return state.merge({
                width: action.payload.width,
                height: action.payload.height
            });

        case WindowActionType.WINDOW_RESCALE:
            return state.merge({
                scale: action.payload
            });

        case WindowActionType.WINDOW_START_ANIMATION:
            stage = action.payload;
            grid.init(mapWidth, mapHeight, state.width, state.height, state.x, state.y);
            return state;

        case WindowActionType.WINDOW_RENDER:
            activeElements.forEach((id) => {
                const e = viewElements.get(id) as ViewElement;
                e.animate();
                // TODO: separate out by type of drawable
                state = state.merge({
                    outposts: state.outposts.set(id, e.drawable)
                });
            });
            return state;

        case SpawnActionType.SPAWN_OUTPOST:
            const outpost = {
                id: ++prevId,
                x: action.payload.x,
                y: action.payload.y,
                state: DrawableState.SPAWNED,
                color: action.payload.color || Constants.COLORS.TAN
            };

            const element = new OutpostElement(outpost);
            viewElements.set(outpost.id, element);
            updateVisibility(grid.insert(element));

            return state.merge({
                outposts: state.outposts.set(outpost.id, outpost)
            });
        default:
            return state;
    }
}

function updateVisibility(visibility: ElementVisibility) {
    if (visibility.included) {
            visibility.included.forEach((id) => {
                activeElements.add(id);
                const e = viewElements.get(id) as ViewElement;
                stage.addChild(e.stage);
            });
        }

    if (visibility.excluded) {
        visibility.excluded.forEach((id) => {
            activeElements.delete(id);
            const e = viewElements.get(id) as ViewElement;
            stage.removeChild(e.stage);
        });
    }
}
