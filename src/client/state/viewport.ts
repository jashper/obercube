import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Dispatch, Delta } from '../actions/action';
import { DestroyActionType } from '../actions/destroy';
import { MatchActionType } from '../actions/match';
import { MouseActionType } from '../actions/mouse';
import { SpawnActionType } from '../actions/spawn';
import { WindowActionType } from '../actions/window';
import { StoreRecords } from './reducers';
import { ViewElementGrid } from '../view/view-element-grid';
import { OutpostElement } from '../view/outpost-element';
import { UnitElement } from '../view/unit-element';
import Constants from '../constants';

interface ViewportState {
    width: number;
    height: number;
}
export interface ViewportStateRecord extends TypedRecord<ViewportStateRecord>, ViewportState {}

export const defaultViewportState = makeTypedFactory<ViewportState, ViewportStateRecord>({
    width: 0,
    height: 0
});

let storeState: StoreRecords;
function getState(): StoreRecords {
    return storeState;
}

let mapWidth: number;
let mapHeight: number;

let activeElementId = 0;
const grid = new ViewElementGrid(25);
let renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

let x = 0;
let y = 0;
let width = 0;
let height = 0;
let scale = 1;

let targetX = 0;
let targetY = 0;
let targetScale = 1;

let isPanning = false;
let panDelta: Delta;

// should only ever modify the viewport state; keeps a reference to the entire store so
// that ViewElements can have access to the most recent state in their animate() cycle
export function viewport(state: StoreRecords, action: Action<any>, dispatch: Dispatch) {
    storeState = state;

    switch (action.type) {
        case WindowActionType.WINDOW_RESIZE:
            width = action.payload.width;
            height = action.payload.height;

            grid.update(x, y, width / scale, height / scale);

            return state.viewport.merge({ width, height });
        case WindowActionType.WINDOW_START_PAN:
            isPanning = true;
            panDelta = action.payload;

            return state.viewport;
        case WindowActionType.WINDOW_END_PAN:
            isPanning = false;

            return state.viewport;
        case MouseActionType.MOUSE_WHEEL:
            setZoomTargets(action.payload);

            return state.viewport;
        case MouseActionType.MOUSE_CLICK:
            // get the local position for the click
            const point = new PIXI.Point(action.payload.x, action.payload.y);
            const localPt = new PIXI.Point();
            PIXI.interaction.InteractionData.prototype.getLocalPosition(grid.stage, localPt, point);

            const elements = grid.getBinElements(localPt.x, localPt.y);
            elements.forEach((e) => {
                if (e instanceof OutpostElement) {
                    activeElementId = e.onClick(activeElementId);
                }
            });

            return state.viewport;
        case WindowActionType.WINDOW_START_ANIMATION:
            renderer = action.payload.renderer;

            grid.stage = action.payload.stage;
            grid.init(mapWidth, mapHeight);

            animate();

            return state.viewport;
        case SpawnActionType.SPAWN_OUTPOST:
        {
            const id = state.outpost.lastId as number;
            const drawable = () => getState().outpost.idMap.get(id);

            const element = new OutpostElement(drawable, getState, dispatch);
            grid.insert(element);

            return state.viewport;
        }
        case SpawnActionType.SPAWN_UNIT:
        {
            const id = state.unit.lastId as number;
            const drawable = () => getState().unit.idMap.get(id);

            const element = new UnitElement(drawable, getState, dispatch);
            grid.insert(element);

            return state.viewport;
        }
        case DestroyActionType.DESTROY_UNIT:
        {
            const id = state.unit.lastId as number;
            grid.remove(id);

            return state.viewport;
        }
        case MatchActionType.NEW_MATCH:
            mapWidth = action.payload.mapWidth;
            mapHeight = action.payload.mapHeight;

            return state.viewport;
        default:
            return state.viewport;
    }
}

function animate() {
    if (isPanning) {
        setPanTargets();
    }

    updateStage();

    grid.activeElements.forEach((e) => e.animate());
    renderer.render(grid.stage);

    requestAnimationFrame(animate);
}

function setPanTargets() {
    targetX += panDelta.dx * scale;
    targetY += panDelta.dy * scale;
}

function setZoomTargets(ev: WheelEvent) {
    const isZoomIn = ev.deltaY < 0;

    const factor = (isZoomIn ? Constants.ZOOM_FACTOR : 1 / Constants.ZOOM_FACTOR);
    const oldScale = targetScale;
    const newScale = targetScale * factor;

    if (newScale <= Constants.MIN_SCALE || newScale >= Constants.MAX_SCALE) {
        return;
    }

    targetScale = newScale;

    // get the local position for the scroll event (i.e. coordinates for when the scale is 1)
    const { clientX, clientY } = ev;
    const point = new PIXI.Point(clientX, clientY);
    const localPt = new PIXI.Point();
    PIXI.interaction.InteractionData.prototype.getLocalPosition(grid.stage, localPt, point);

    // transform the origin in order to center the zoom at the coordinates of the scroll event
    const delta = targetScale - oldScale;
    targetX -= localPt.x * delta;
    targetY -= localPt.y * delta;
}

function updateStage() {
    const k = 7;

    grid.stage.x += (targetX - grid.stage.x) * k * (1 / 60);
    grid.stage.y += (targetY - grid.stage.y) * k * (1 / 60);

    scale += (targetScale - scale) * k * (1 / 60);
    grid.stage.scale.set(scale, scale);

    // restrict movement to the borders of the map
    // grid.stage.x = Math.max(-mapWidth * scale + width, Math.min(0, grid.stage.x));
    // grid.stage.y = Math.max(-mapHeight * scale + height, Math.min(0, grid.stage.y));

    // get the new top left corner offset
    x = -grid.stage.x / scale;
    y = -grid.stage.y / scale;

    // expensive visibility check -> no need to run every frame, only when necessary
    // TODO: this shouldn't be necessary -> we should only be doing this when the targets are set, not every frame
    if (Math.abs(targetX - grid.stage.x) > 10 || Math.abs(targetY - grid.stage.y) > 10 ||
            Math.abs(targetScale - scale) > 10) {
        grid.update(x, y, width / scale, height / scale);
    }
}
