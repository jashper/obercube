import * as PIXI from 'pixi.js';

import { Action, Drawable } from '../actions/action';
import { Dispatch } from '../actions/action';
import { StoreRecords } from '../state/reducers';

export abstract class ViewElement {
    stage = new PIXI.Sprite();
    bounds: PIXI.Rectangle;

    protected actionQueue: Action<any>[] = [];

    constructor(readonly drawable: () => Drawable,
                readonly state: () => StoreRecords,
                readonly dispatch: Dispatch
    ) {
        // keep track of the drawable just in case it's destroyed in the global state
        let prevDrawable: Drawable;

        this.drawable = () => {
            prevDrawable = drawable() || prevDrawable;
            return prevDrawable;
        };
    }

    animate() {
        if (this.actionQueue.length > 0) {
            this.actionQueue.forEach((action) => this.dispatch(action));
            this.actionQueue = [];
        }
    }
}
