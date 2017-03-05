import * as PIXI from 'pixi.js';

import { Dispatch, Outpost } from '../../action';
import Constants from '../../constants';
import { SpawnAction } from '../actions/spawn';
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

        const color = Constants.COLOR_MAP.get(d.playerId)!;
        this.stage = new PIXI.Sprite(OutpostTextures[color]);
        this.stage.x = d.x + r;
        this.stage.y = d.y + r;
        this.stage.pivot.set(r, r);

        this.maxBounds = this.stage.getLocalBounds();
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
        super.animate();

        this.stage.rotation += OutpostElement.rotation;
    }

    // TODO: check to see if the click event is inside the outpost
    onClick(activeId: number) {
        const id = this.drawable().id;
        if (activeId === 0) {
            return id;
        } else if (activeId !== id) {
            this.actionQueue.push(SpawnAction.unit({
                id: 0,
                src: activeId,
                dst: id
            }));

            return 0;
        } else {
            return activeId;
        }
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    OutpostTextures[color] = OutpostElement.GENERATE_SPRITE(color);
});
