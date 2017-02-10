import * as PIXI from 'pixi.js';

import { Dispatch, Outpost } from '../actions/action';
import Constants from '../constants';
import { OutpostSpawnInfo } from '../actions/spawn';
import { StoreRecords } from '../state/reducers';
import { ViewElement } from './view-element';

const OutpostTextures: {[key: number]: PIXI.Texture} = {};

export class OutpostElement extends ViewElement {
    static radius = 20;
    static rotation = 3 * (Math.PI / 180);

    constructor(readonly drawable: () => Outpost,
                readonly state: () => StoreRecords,
                readonly dispatch: Dispatch
    ) {
        super(drawable, state, dispatch);

        const d = this.drawable();
        const r = OutpostElement.radius;

        this.stage = new PIXI.Sprite(OutpostTextures[d.color]);
        this.stage.x = d.x + r;
        this.stage.y = d.y + r;
        this.stage.pivot.set(r, r);
    }

    static GENERATE_DRAWABLE(id: number, info: OutpostSpawnInfo): Outpost {
        return {
            id,
            color: info.color,
            x: info.x,
            y: info.y
        };
    }

    static GENERATE_SPRITE(color: number): PIXI.Texture {
        const r = OutpostElement.radius;

        const circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(r, r, r);
        circle.endFill();

        circle.beginFill(Constants.BACKGROUND_COLOR);
        circle.drawCircle(r, r, 15);
        circle.endFill();

        circle.beginFill(color);
        circle.drawCircle(r, r, 7);
        circle.endFill();

        for (let theta = 0; theta < 360; theta += 45) {
            const x = r + 11 * Math.cos(theta * (Math.PI / 180));
            const y = r + 11 * Math.sin(theta * (Math.PI / 180));

            circle.beginFill(color);
            circle.drawCircle(x, y, 2);
            circle.endFill();
        }

        return circle.generateCanvasTexture();
    }

    animate() {
        this.stage.rotation += OutpostElement.rotation;
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    OutpostTextures[color] = OutpostElement.GENERATE_SPRITE(color);
});
