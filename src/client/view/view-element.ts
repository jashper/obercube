import * as PIXI from 'pixi.js';

import { Action, Dispatch, Drawable } from '../../action';
import { StoreRecords } from '../state/reducers';

export abstract class ViewElement {
    stage = new PIXI.Sprite();
    maxBounds: PIXI.Rectangle; // IMPORTANT! this must represent the maximum bounds that stage can ever take on

    protected actionQueue: Action<any>[] = [];
    private prevTick = 0;

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

    animate(tick: number) {
        if (this.actionQueue.length > 0) {
            this.actionQueue.forEach((action) => this.dispatch(action));
            this.actionQueue = [];
        }
    }

    // allow for a certain amount of phase lag relative to the server's clock
    protected adjustTick(tick: number): number {
        if (Math.abs(tick - this.prevTick) <= 5) {
            this.prevTick++;
        } else {
            this.prevTick = tick;
        }

        return this.prevTick;
    }
}
