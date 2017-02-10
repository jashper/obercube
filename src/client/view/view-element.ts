import * as PIXI from 'pixi.js';

import { Drawable } from '../actions/action';
import { Dispatch } from '../actions/action';
import { StoreRecords } from '../state/reducers';

export abstract class ViewElement {
    stage = new PIXI.Sprite();

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

    abstract animate(): void;
}
