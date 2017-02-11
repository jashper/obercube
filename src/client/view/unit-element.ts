import * as PIXI from 'pixi.js';

import { Coordinates, Dispatch, Unit } from '../actions/action';
import { DestroyAction } from '../actions/destroy';
import { UnitSpawnInfo } from '../actions/spawn';
import Constants from '../constants';
import { OutpostElement } from './outpost-element';
import { StoreRecords } from '../state/reducers';
import { ViewElement } from './view-element';

const SubmarineTextures: {[key: number]: PIXI.Texture} = {};

export class UnitElement extends ViewElement {
    static speed = 0.75;

    private submarine: PIXI.Sprite;

    private isDone = false;
    private src: Coordinates;
    private dst: Coordinates;
    private theta: number;

    constructor(readonly drawable: () => Unit,
                readonly state: () => StoreRecords,
                readonly dispatch: Dispatch
    ) {
        super(drawable, state, dispatch);

        this.setCoordinates();

        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF);

        line.moveTo(0, 0);
        line.lineTo(this.dst.x - this.src.x, this.dst.y - this.src.y);

        this.stage.x = this.src.x;
        this.stage.y = this.src.y;
        this.stage.addChild(line);

        const d = this.drawable();
        this.submarine = new PIXI.Sprite(SubmarineTextures[d.color]);
        this.submarine.x += 20 * Math.cos(this.theta);
        this.submarine.y += 20 * Math.sin(this.theta);
        this.submarine.pivot.set(6, 20);
        this.submarine.rotation -= (Math.PI / 2) - this.theta;
        this.stage.addChild(this.submarine);
    }

    private setCoordinates() {
        const d = this.drawable();
        const src = this.state().outpost.idMap.get(d.src as number);
        const dst = this.state().outpost.idMap.get(d.dst as number);

        const r = OutpostElement.radius;
        const theta = Math.atan2(dst.y - src.y, dst.x - src.x);

        this.src = { x: src.x + r * (1 + Math.cos(theta)), y: src.y + r * (1 + Math.sin(theta)) };
        this.dst = { x: dst.x + r * (1 - Math.cos(theta)), y: dst.y + r * (1 - Math.sin(theta)) };
        this.theta = theta;
    }

    static GENERATE_DRAWABLE(id: number, info: UnitSpawnInfo): Unit {
        return {
            id,
            color: info.color,
            src: info.src,
            dst: info.dst
        };
    }

    static GENERATE_SUBMARINE_SPRITE(color: number): PIXI.Texture {
        const ellipse = new PIXI.Graphics();
        ellipse.beginFill(color);
        ellipse.drawEllipse(6, 20, 6, 20);
        ellipse.endFill();

        return ellipse.generateCanvasTexture();
    }

    animate() {
        if (this.isDone) {
            return;
        }

        const d = this.drawable();
        const { width, height } = this.submarine.getLocalBounds();

        if (this.submarine.x + width >= this.dst.x - this.src.x + 20 ||
                this.submarine.y + height >= this.dst.y - this.src.y + 20) {
            this.dispatch(DestroyAction.unit(d.id));
            this.isDone = true;
            return;
        }

        this.submarine.x += UnitElement.speed * Math.cos(this.theta);
        this.submarine.y += UnitElement.speed * Math.sin(this.theta);
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    SubmarineTextures[color] = UnitElement.GENERATE_SUBMARINE_SPRITE(color);
});
