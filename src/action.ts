import * as PIXI from 'pixi.js';

export interface Action<P> {
    type: string;
    payload: P;
    userId?: number;
    fromServer?: boolean;
}

export type Dispatch = (action: Action<any>) => Action<any>;

export type Middleware<Store> = (store: Store) => (next: Dispatch) => Dispatch;

export interface Coordinates {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface Delta {
    dx: number;
    dy: number;
}

export interface Drawable {
    id: number; // 0 if it needs to be generated by the client
}
export interface StaticDrawable extends Drawable {
    // top-left corner coordinates
    x: number;
    y: number;
}
export interface DynamicDrawable extends Drawable {
    // top-left corner coordinates or ids of other drawables
    src: Coordinates | number; // where it starts
    dst: Coordinates | number; // where it ends
}

export interface Outpost extends StaticDrawable {
    playerId: number; // id of player that currently owns/occupies the Outpost
}

export interface Unit extends DynamicDrawable {}

export interface MapInfo {
    width: number;
    height: number;
}

export interface Player {
    id: number;
}

export interface User {
    id: number;
    activeMatchId?: number;
}

export interface RendererInfo {
    stage: PIXI.Container;
    renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
}
