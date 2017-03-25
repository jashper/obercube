import * as PIXI from 'pixi.js';

import { Action, Dispatch, Drawable, DynamicDrawable } from '../../action';
import { StoreRecords } from '../state/reducers';

export abstract class ViewElement {
    stage = new PIXI.Container();
    maxBounds: PIXI.Rectangle; // IMPORTANT! this must represent the maximum bounds that stage can ever take on

    protected actionQueue: Action<any>[] = [];

    private prevTick = 0;
    private delta = 0;

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

    // figures out how far along the drawable is in it's motion;
    // only ever called when the drawable is a DynamicDrawable (i.e. it has a start and end tick)
    protected getDelta(tick: number): number {
        const d = this.drawable() as DynamicDrawable;

        // allows for continuous motion (i.e. ignore the tick engine when it's slightly out of sync with the server)
        if (Math.abs(tick - this.prevTick) <= 2) {
            this.delta++;
        } else {
            this.delta = tick - d.startTick;
        }

        this.delta = Math.min(this.delta, d.endTick - d.startTick); // cap at the end of motion
        this.prevTick = tick;

        return this.delta;
    }
}
