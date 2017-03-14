import * as PIXI from 'pixi.js';

import { Delta, Middleware } from '../../action';
import { DestroyActionType } from '../actions/destroy';
import { MatchActionType } from '../../server/actions/match';
import { MouseActionType } from '../actions/mouse';
import { SpawnActionType } from '../actions/spawn';
import { WindowActionType } from '../actions/window';
import { ClientStore, StoreRecords } from '../state/reducers';
import { ViewElementGrid } from '../view/view-element-grid';
import { OutpostElement } from '../view/outpost-element';
import { UnitElement } from '../view/unit-element';
import Constants from '../../constants';
import IdGenerator from '../../id-generator';

let storeState: StoreRecords;
function getState(): StoreRecords {
    return storeState;
}

let mapWidth: number;
let mapHeight: number;

let activeElementId = 0;
const grid = new ViewElementGrid(1000);
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

// keeps a reference to the entire store so that ViewElements can have
// access to the most recent state in their animate() cycle
export const viewportController: Middleware<ClientStore> = store => next => action => {
    const result = next(action);

    const state = store.getState();
    storeState = state;

    switch (action.type) {
        case WindowActionType.WINDOW_RESIZE:
            width = action.payload.width;
            height = action.payload.height;

            grid.update(x, y, width / scale, height / scale);

            return result;
        case WindowActionType.WINDOW_START_PAN:
            isPanning = true;
            panDelta = action.payload;

            return result;
        case WindowActionType.WINDOW_END_PAN:
            isPanning = false;

            return result;
        case MouseActionType.MOUSE_WHEEL:
            setZoomTargets(action.payload);

            return result;
        case MouseActionType.MOUSE_CLICK:
            // get the local position for the click
            const point = new PIXI.Point(action.payload.x, action.payload.y);
            const localPt = new PIXI.Point();
            PIXI.interaction.InteractionData.prototype.getLocalPosition(grid.stage, localPt, point);

            const elements = grid.getBinElements(localPt.x, localPt.y);
            elements.forEach((e) => {
                if (e instanceof OutpostElement) {
                    const d = e.drawable();
                    if (localPt.x >= d.x && localPt.y >= d.y &&
                            localPt.x <= d.x + e.maxBounds.width && localPt.y <= d.y + e.maxBounds.height) {
                        activeElementId = e.onClick(activeElementId);
                    }
                }
            });

            return result;
        case WindowActionType.WINDOW_START_ANIMATION:
            renderer = action.payload.renderer;
            grid.stage = action.payload.stage;

            animate();

            return result;
        case SpawnActionType.SPAWN_UNIT:
        {
            const id = state.game.units.last().id;
            const drawable = () => getState().game.units.get(id);

            const element = new UnitElement(drawable, getState, store.dispatch);
            grid.insert(element);

            return result;
        }
        case DestroyActionType.DESTROY_UNIT:
        {
            grid.remove(action.payload);

            return result;
        }
        case MatchActionType.GAME_STATE:
            IdGenerator.Init(state.game.playerId, 8);

            mapWidth = state.game.mapInfo.width;
            mapHeight = state.game.mapInfo.height;

            grid.init(mapWidth, mapHeight);

            state.game.outposts.forEach((outpost, id) => {
                const drawable = () => getState().game.outposts.get(id!);

                const element = new OutpostElement(drawable, getState, store.dispatch);
                grid.insert(element);
            });

            return result;
        default:
            return result;
    }
};

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

    if (Math.abs(targetX - grid.stage.x) > 1 || Math.abs(targetY - grid.stage.y) > 1 ||
            Math.abs(targetScale - scale) > 1) {
        grid.update(x, y, width / scale, height / scale);
    }
}
