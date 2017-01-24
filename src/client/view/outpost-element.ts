import * as PIXI from 'pixi.js';

import { Outpost } from '../actions/action';
import Constants from '../constants';
import { ViewElement } from './view-element-grid';

const OutpostTextures: {[key: number]: PIXI.Texture} = {};

export class OutpostElement implements ViewElement {
    static rotation = 3 * (Math.PI / 180);

    readonly drawable: () => Outpost;
    readonly stage: PIXI.Sprite;

    constructor(drawable: () => Outpost) {
        this.drawable = drawable;
        const d = this.drawable();

        this.stage = new PIXI.Sprite(OutpostTextures[d.color]);
        this.stage.scale.set(0.1, 0.1);
        this.stage.pivot.set(200, 200);
        this.stage.x = d.x;
        this.stage.y = d.y;
    }

    static GENERATE_SPRITE(color: number): PIXI.Texture {
        const circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(200, 200, 200);
        circle.endFill();

        circle.beginFill(Constants.BACKGROUND_COLOR);
        circle.drawCircle(200, 200, 155);
        circle.endFill();

        circle.beginFill(color);
        circle.drawCircle(200, 200, 70);
        circle.endFill();

        for (let theta = 0; theta < 360; theta += 45) {
            const x = 200 + 110 * Math.cos(theta * (Math.PI / 180));
            const y = 200 + 110 * Math.sin(theta * (Math.PI / 180));

            circle.beginFill(color);
            circle.drawCircle(x, y, 20);
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
