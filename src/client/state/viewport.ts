import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action } from '../actions/action';
import { MatchActionType } from '../actions/match';
import { MouseActionType } from '../actions/mouse';
import { SpawnActionType } from '../actions/spawn';
import { WindowActionType } from '../actions/window';
import { ViewElementGrid } from '../view/view-element-grid';
import { OutpostElement } from '../view/outpost-element';
import Constants from '../constants';

interface ViewportState {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
}
export interface ViewportStateRecord extends TypedRecord<ViewportStateRecord>, ViewportState {}

const defaultState = makeTypedFactory<ViewportState, ViewportStateRecord>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
});

let renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
let mapWidth: number;
let mapHeight: number;
const grid = new ViewElementGrid(100);

let prevId = 0;

export function viewport(state: ViewportStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case MatchActionType.NEW_MATCH:
            mapWidth = action.payload.mapWidth;
            mapHeight = action.payload.mapHeight;
            return state;

        case WindowActionType.WINDOW_RESIZE:
            // uncenterScaledMap(state.width, state.height, state.scale);
            // recenterScaledMap(action.payload.width, action.payload.height, state.scale);

            const { width, height } = action.payload;
            grid.resize(width / state.scale, height / state.scale);

            return state.merge({
                width: action.payload.width,
                height: action.payload.height
            });

        case MouseActionType.MOUSE_WHEEL:
            const isZoomIn = action.payload.deltaY < 0;

            const factor = (isZoomIn ? Constants.ZOOM_FACTOR : 1 / Constants.ZOOM_FACTOR);
            const scale = state.scale * factor;

            if (scale <= Constants.MIN_SCALE) {
                return state;
            } else if (scale >= Constants.MAX_SCALE) {
                return state;
            }

            // get the local position for the click event (i.e. coordinates for when the scale is 1)
            const { clientX, clientY } = action.payload;
            const point = new PIXI.Point(clientX, clientY);
            const localPt = new PIXI.Point();
            PIXI.interaction.InteractionData.prototype.getLocalPosition(grid.stage, localPt, point);

            // cap scroll events at the borders of the map 
            localPt.x = Math.max(0, Math.min(mapWidth, localPt.x));
            localPt.y = Math.max(0, Math.min(mapHeight, localPt.y));

            // transform the origin in order to center the zoom at the coordinates of the scroll event
            grid.stage.x = Math.min(0, point.x - (localPt.x * scale));
            grid.stage.y = Math.min(0, point.y - (localPt.y * scale));

            // get the new top left corner offset
            let { x, y } = grid.stage;
            x = -x / scale;
            y = -y / scale;

            // recenterScaledMap(state.width, state.height, scale);
            grid.stage.scale.set(scale, scale);
            grid.zoom(x, y, state.width / scale, state.height / scale);

            return state.merge({
                x,
                y,
                scale
            });
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
        default:
            return state;
    }
}

function animate() {
    grid.activeElements.forEach((e) => e.animate());
    console.log(grid.activeElements.length);
    renderer.render(grid.stage);
    requestAnimationFrame(animate);
}

// function recenterScaledMap(width: number, height: number, scale: number) {
//     // keep the map centered (i.e. check to see if the scaled dimensions exceed the map)
//     const widthDelta = width - scale * mapWidth;
//     const heightDelta = height - scale * mapHeight;
//     if (widthDelta > 0) {
//         stage.x += widthDelta / 2;
//     }
//     if (heightDelta > 0) {
//         stage.y += heightDelta / 2;
//     }
// }

// function uncenterScaledMap(width: number, height: number, scale: number) {
//     const widthDelta = width - scale * mapWidth;
//     const heightDelta = height - scale * mapHeight;
//     if (widthDelta > 0) {
//         stage.x -= widthDelta / 2;
//     }
//     if (heightDelta > 0) {
//         stage.y -= heightDelta / 2;
//     }
// }
