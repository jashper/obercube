import * as PIXI from 'pixi.js';

export interface Action<P> {
    type: string;
    payload: P;
}

export type Dispatch = <T>(action: Action<T>) => void;

export interface Coordinates {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface Drawable {
    id: number;
    color: number;
}
export interface StaticDrawable extends Drawable {
    x: number;
    y: number;
}
export interface DynamicDrawable extends Drawable {
    src: Coordinates;
    dst: Coordinates;
}

export interface Outpost extends StaticDrawable {}
export interface Unit extends DynamicDrawable {}

export interface RendererInfo {
    stage: PIXI.Container;
    renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
}
