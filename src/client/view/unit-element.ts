import * as PIXI from 'pixi.js';

import { Coordinates, Dispatch, Unit } from '../../action';
import { DestroyAction } from '../actions/destroy';
import Constants from '../../constants';
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
        this.stage.x = Math.min(this.src.x, this.dst.x);
        this.stage.y = Math.min(this.src.y, this.dst.y);

        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF);

        line.moveTo(this.src.x - this.stage.x, this.src.y - this.stage.y);
        line.lineTo(this.dst.x - this.stage.x, this.dst.y - this.stage.y);
        this.stage.addChild(line);

        const d = this.drawable();
        const playerId = this.state().game.outposts.get(d.src as number).playerId;
        const color = Constants.COLOR_MAP.get(playerId)!;

        this.submarine = new PIXI.Sprite(SubmarineTextures[color]);
        this.submarine.x = this.src.x - this.stage.x;
        this.submarine.y = this.src.y - this.stage.y;

        this.submarine.x -= 6 * Math.sin(this.theta);
        this.submarine.y += 6 * Math.cos(this.theta);
        this.submarine.rotation -= (Math.PI / 2) - this.theta;
        this.stage.addChild(this.submarine);

        this.maxBounds = this.stage.getLocalBounds();
    }

    private setCoordinates() {
        const d = this.drawable();
        const src = this.state().game.outposts.get(d.src as number);
        const dst = this.state().game.outposts.get(d.dst as number);

        const r = OutpostElement.radius;

        let theta = Math.atan2(dst.y - src.y, dst.x - src.x);
        theta = theta < 0 ? theta + 2 * Math.PI : theta;

        this.src = { x: src.x + r * (1 + Math.cos(theta)), y: src.y + r * (1 + Math.sin(theta)) };
        this.dst = { x: dst.x + r * (1 - Math.cos(theta)), y: dst.y + r * (1 - Math.sin(theta)) };
        this.theta = theta;
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

        const x = this.stage.x + this.submarine.x + 40 * Math.cos(this.theta);
        const y = this.stage.y + this.submarine.y + 40 * Math.sin(this.theta);

        if (Math.abs(x - this.dst.x) <= 1 || Math.abs(y - this.dst.y) <= 1) {
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
