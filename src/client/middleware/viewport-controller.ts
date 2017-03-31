import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { Subscription } from 'rxjs/Subscription';

import { Delta, Middleware, RendererInfo } from '../../action';
import { DestroyAction, DestroyActionType } from '../actions/destroy';
import { MatchActionType } from '../../server/actions/match';
import { GameTickEngine } from '../../game-tick-engine';
import { GameTickActionType } from '../../server/actions/game-tick';
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

const engine = new GameTickEngine();
let engineSub: Subscription;

let mapWidth: number;
let mapHeight: number;

let activeElementId = 0;
const grid = new ViewElementGrid(100);
let UIrenderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
let renderer: THREE.WebGLRenderer;

let camera: THREE.OrthographicCamera;
let scene: THREE.Scene;
// new THREE.OrthographicCamera(
//     -dimensions.width / 2, -dimensions.height / 2,
//     dimensions.width / 2, dimensions.height / 2,
//     0.1, 20000
// );
// this.camera.position.set(0,6,0);
// this.scene.add(camera);

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
        case GameTickActionType.START_TICK:
            engineSub = engine.src.subscribe((a) => store.dispatch(a));
            engine.start(action.payload);
            return result;
        case GameTickActionType.SYNCHRONIZE_TICK:
            engine.sync(action.payload);
            return result;
        case GameTickActionType.QUEUE_EVENT:
            engine.queueEvent(action.payload);
            return result;
        case WindowActionType.WINDOW_RESIZE:
            width = action.payload.width;
            height = action.payload.height;

            grid.update(x, y, width / scale, height / scale);
            renderer.setSize(width, height);
            camera.left = -width / 2;
            camera.top = -height / 2;
            camera.right = width / 2;
            camera.bottom = height / 2;
            camera.updateProjectionMatrix();

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
                        activeElementId = e.onClick(activeElementId, engine.tick);
                    }
                }
            });

            return result;
        case WindowActionType.WINDOW_START_ANIMATION:
            const rendererInfo = action.payload as RendererInfo;
            // Screen parameters
            width = rendererInfo.dimensions.width;
            height = rendererInfo.dimensions.height;

            // UI rendering
            UIrenderer = rendererInfo.UIrenderer;
            grid.stage = rendererInfo.stage;

            // Scene rendering
            renderer = rendererInfo.renderer;
            camera = new THREE.OrthographicCamera(
                -width / 2, -height / 2, width / 2, height / 2,
                Constants.MIN_ORTHO_DEPTH, Constants.MAX_ORTHO_DEPTH
            );
            scene = new THREE.Scene();
            scene.add(camera);
            camera.position.x = 0;
            camera.position.y = 100;
            camera.position.z = 100;
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            (window as any).CAM = camera;

            const geometry = new THREE.BoxGeometry( 20, 20, 20 );
            const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            const mesh = new THREE.Mesh( geometry, material );
            mesh.rotateY(45);
            scene.add( mesh );

            const light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff);
            light.position.set(1, -1, -1);
            scene.add(light);
            const lightAmb: THREE.AmbientLight = new THREE.AmbientLight( 0x404040 );
            scene.add( lightAmb );

            animate();

            return result;
        case SpawnActionType.SPAWN_UNIT:
        {
            const id = state.game.units.last().id;
            const drawable = () => getState().game.units.get(id);

            if (!grid.getElement(id)) {
                const element = new UnitElement(drawable, getState, store.dispatch);
                grid.insert(element);
            }

            const endTick = drawable().endTick;
            if (endTick > 0) {
                engine.queueEvent({
                    trigger: endTick,
                    interval: 0,
                    action: () => DestroyAction.unit(id)
                });
            }

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

            state.game.outposts.forEach((outpost, id: number) => {
                const drawable = () => getState().game.outposts.get(id);

                const element = new OutpostElement(drawable, getState, store.dispatch);
                grid.insert(element);
            });

            state.game.units.forEach((unit, id: number) => {
                const drawable = () => getState().game.units.get(id);

                const element = new UnitElement(drawable, getState, store.dispatch);
                grid.insert(element);

                engine.queueEvent({
                    trigger: drawable().endTick,
                    interval: 0,
                    action: () => DestroyAction.unit(id)
                });
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

    grid.activeElements.forEach((e) => e.animate(engine.tick));
    UIrenderer.render(grid.stage);
    renderer.render( scene, camera );

    engine.increment();

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
