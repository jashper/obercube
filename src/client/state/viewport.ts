import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Dispatch } from '../actions/action';
import { MatchActionType } from '../actions/match';
import { MouseActionType } from '../actions/mouse';
import { SpawnActionType } from '../actions/spawn';
import { WindowActionType } from '../actions/window';
import { ViewElementGrid } from '../view/view-element-grid';
import { OutpostElement } from '../view/outpost-element';
import Constants from '../constants';

interface ViewportState {
    width: number;
    height: number;
}
export interface ViewportStateRecord extends TypedRecord<ViewportStateRecord>, ViewportState {}

const defaultState = makeTypedFactory<ViewportState, ViewportStateRecord>({
    width: 0,
    height: 0
});

let prevId = 0;
let renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

let mapWidth: number;
let mapHeight: number;
const grid = new ViewElementGrid(100);

let x = 0;
let y = 0;
let viewWidth = 0;
let viewHeight = 0;
let scale = 1;

let isPanning = false;
let panningTheta = 0;

export function viewport(state: ViewportStateRecord = defaultState(), action: Action<any>, dispatch: Dispatch) {
    switch (action.type) {
        case WindowActionType.WINDOW_RESIZE:
            const { width, height } = action.payload;
            viewWidth = width;
            viewHeight = height;

            grid.resize(width / scale, height / scale);

            return state.merge({ width, height });
        case WindowActionType.WINDOW_START_PAN:
            isPanning = true;
            panningTheta = action.payload;

            return state;
        case WindowActionType.WINDOW_END_PAN:
            isPanning = false;

            return state;
        case MouseActionType.MOUSE_WHEEL:
            zoom(action.payload);

            return state;
        case WindowActionType.WINDOW_START_ANIMATION:
            renderer = action.payload.renderer;

            grid.stage = action.payload.stage;
            grid.init(mapWidth, mapHeight);

            animate();

            return state;
        case SpawnActionType.SPAWN_OUTPOST:
           const outpost = {
                id: ++prevId,
                x: action.payload.x,
                y: action.payload.y,
                color: action.payload.color || Constants.COLORS.TAN
            };

            const element = new OutpostElement(outpost);
            grid.insert(element);

            return state;
        case MatchActionType.NEW_MATCH:
            mapWidth = action.payload.mapWidth;
            mapHeight = action.payload.mapHeight;

            return state;
        default:
            console.log(action);
            return state;
    }
}

function animate() {
    if (isPanning) {
        pan();
    }

    grid.activeElements.forEach((e) => e.animate());
    renderer.render(grid.stage);

    requestAnimationFrame(animate);
}

function pan() {
    grid.stage.x += Math.cos(panningTheta) * 10 * scale;
    grid.stage.y += Math.sin(panningTheta) * 10 * scale;

    // restrict movement to the borders of the map 
    grid.stage.x = Math.max(-mapWidth * scale + viewWidth, Math.min(0, grid.stage.x));
    grid.stage.y = Math.max(-mapHeight * scale + viewHeight, Math.min(0, grid.stage.y));

    // get the new top left corner offset
    x = -grid.stage.x / scale;
    y = -grid.stage.y / scale;

    grid.pan(x, y);
}

function zoom(ev: WheelEvent) {
    const isZoomIn = ev.deltaY < 0;

    const factor = (isZoomIn ? Constants.ZOOM_FACTOR : 1 / Constants.ZOOM_FACTOR);
    const oldScale = scale;
    const newScale = scale * factor;

    if (newScale <= Constants.MIN_SCALE || newScale >= Constants.MAX_SCALE) {
        return;
    }

    scale = newScale;

    // get the local position for the scroll event (i.e. coordinates for when the scale is 1)
    const { clientX, clientY } = ev;
    const point = new PIXI.Point(clientX, clientY);
    const localPt = new PIXI.Point();
    PIXI.interaction.InteractionData.prototype.getLocalPosition(grid.stage, localPt, point);

    // transform the origin in order to center the zoom at the coordinates of the scroll event
    const delta = scale - oldScale;
    grid.stage.x -= localPt.x * delta;
    grid.stage.y -= localPt.y * delta;

    // restrict movement to the borders of the map 
    grid.stage.x = Math.max(-mapWidth * scale + viewWidth, Math.min(0, grid.stage.x));
    grid.stage.y = Math.max(-mapHeight * scale + viewHeight, Math.min(0, grid.stage.y));

    // get the new top left corner offset
    x = -grid.stage.x / scale;
    y = -grid.stage.y / scale;

    grid.stage.scale.set(scale, scale);
    grid.zoom(x, y, viewWidth / scale, viewHeight / scale);
}
