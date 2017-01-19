import * as PIXI from 'pixi.js';

export interface Action<P> {
    type: string;
    payload: P;
}

export type Dispatch = <T>(action: Action<T>) => void;

export interface Dimensions {
    width: number;
    height: number;
}

export interface Drawable {
    id: number;
    x: number;
    y: number;
    color: number;
}

export interface Outpost extends Drawable {}

export interface RendererInfo {
    stage: PIXI.Container;
    renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
}
