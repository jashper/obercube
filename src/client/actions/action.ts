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

export enum DrawableState {
    SPAWNED = 0
}

export interface Drawable {
    id: number;
    x: number;
    y: number;
    state: DrawableState;
}

export interface Outpost extends Drawable {}
