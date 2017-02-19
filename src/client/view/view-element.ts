import * as PIXI from 'pixi.js';

import { Action, Dispatch, Drawable } from '../../action';
import { StoreRecords } from '../state/reducers';

export abstract class ViewElement {
    stage = new PIXI.Sprite();
    maxBounds: PIXI.Rectangle; // IMPORTANT! this must represent the maximum bounds that stage can ever take on

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
