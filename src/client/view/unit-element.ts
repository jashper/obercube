import * as PIXI from 'pixi.js';

import { Dispatch, Unit } from '../actions/action';
import { DestroyAction } from '../actions/destroy';
import { UnitSpawnInfo } from '../actions/spawn';
import Constants from '../constants';
import { OutpostElement } from './outpost-element';
import { ViewElement } from './view-element-grid';

const SubmarineTextures: {[key: number]: PIXI.Texture} = {};

export class UnitElement implements ViewElement {
    static speed = 0.75;

    readonly drawable: () => Unit;
    private prevDrawable = {} as Unit;
    private dispatch: Dispatch;

    readonly stage: PIXI.Sprite;
    private submarine: PIXI.Sprite;
    private isDone = false;

    constructor(drawable: () => Unit, dispatch: Dispatch) {
        this.drawable = () => {
            this.prevDrawable = drawable() || this.prevDrawable;
            return this.prevDrawable;
        };
        this.dispatch = dispatch;
        this.stage = new PIXI.Sprite();

        const d = this.drawable();
        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF);

        line.moveTo(0, 0);
        line.lineTo(d.dst.x - d.src.x, d.dst.y - d.src.y);

        this.stage.x = d.src.x;
        this.stage.y = d.src.y;
        this.stage.addChild(line);

        this.submarine = new PIXI.Sprite(SubmarineTextures[d.color]);
        this.submarine.x += 20 * Math.cos(d.theta);
        this.submarine.y += 20 * Math.sin(d.theta);
        this.submarine.pivot.set(6, 20);
        this.submarine.rotation -= (Math.PI / 2) - d.theta;
        this.stage.addChild(this.submarine);
    }

    static GENERATE_DRAWABLE(id: number, info: UnitSpawnInfo): Unit {
        const { src, dst } = info;
        const r = OutpostElement.radius;
        const theta = Math.atan2(dst.y - src.y, dst.x - src.x);

        return {
            id,
            color: info.color,
            src: { x: src.x + r * (1 + Math.cos(theta)), y: src.y + r * (1 + Math.sin(theta)) },
            dst: { x: dst.x + r * (1 - Math.cos(theta)), y: dst.y + r * (1 - Math.sin(theta)) },
            theta
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
        if (this.submarine.x + this.submarine.getBounds().width >= d.dst.x - d.src.x + 20 ||
                this.submarine.y + this.submarine.getBounds().height >= d.dst.y - d.src.y + 20) {
            this.dispatch(DestroyAction.unit(d.id));
            this.isDone = true;
            return;
        }

        this.submarine.x += UnitElement.speed * Math.cos(d.theta);
        this.submarine.y += UnitElement.speed * Math.sin(d.theta);
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    SubmarineTextures[color] = UnitElement.GENERATE_SUBMARINE_SPRITE(color);
});
