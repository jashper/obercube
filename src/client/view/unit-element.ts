import * as PIXI from 'pixi.js';

import { Coordinates, Dispatch, Unit, Outpost } from '../../action';
import Constants from '../../constants';
import { OutpostElement } from './outpost-element';
import { StoreRecords } from '../state/reducers';
import { ViewElement } from './view-element';

const SubmarineTextures: {[key: number]: PIXI.Texture} = {};

interface LineInfo {
    theta: number;
    src: Coordinates;
    dst: Coordinates;
    stage: Coordinates;
}

interface SubmarineInfo {
    src: Coordinates;
    dst: Coordinates;
    rotation: number;
}

export class UnitElement extends ViewElement {
    static speed = 1; // distance / tick
    private prevTick = 0;

    private lineInfo: LineInfo;
    private subInfo: SubmarineInfo;

    private submarine: PIXI.Sprite;

    constructor(readonly drawable: () => Unit,
                readonly state: () => StoreRecords,
                readonly dispatch: Dispatch
    ) {
        super(drawable, state, dispatch);

        const d = this.drawable();
        const src = this.state().game.outposts.get(d.src as number);
        const dst = this.state().game.outposts.get(d.dst as number);

        this.lineInfo = UnitElement.getLineInfo(src, dst);
        this.stage.x = this.lineInfo.stage.x;
        this.stage.y = this.lineInfo.stage.y;

        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF);

        line.moveTo(this.lineInfo.src.x - this.stage.x, this.lineInfo.src.y - this.stage.y);
        line.lineTo(this.lineInfo.dst.x - this.stage.x, this.lineInfo.dst.y - this.stage.y);
        this.stage.addChild(line);

        const playerId = this.state().game.outposts.get(d.src as number).playerId;
        const color = Constants.COLOR_MAP.get(playerId)!;
        this.submarine = new PIXI.Sprite(SubmarineTextures[color]);

        this.subInfo = UnitElement.getSubmarineInfo(this.lineInfo);
        this.submarine.x = this.subInfo.src.x;
        this.submarine.y = this.subInfo.src.y;
        this.submarine.rotation = this.subInfo.rotation;
        this.stage.addChild(this.submarine);

        this.maxBounds = this.stage.getLocalBounds();
    }

    static GET_END_TICK(src: Outpost, dst: Outpost, startTick: number): number {
        const lineInfo = UnitElement.getLineInfo(src, dst);
        const subInfo = UnitElement.getSubmarineInfo(lineInfo);

        const distance = Math.sqrt(
            Math.pow((subInfo.src.x - subInfo.dst.x), 2) +
            Math.pow((subInfo.src.y - subInfo.dst.y), 2)
        );
        return startTick + (distance / UnitElement.speed) + 1;
    }

    private static getLineInfo(src: Outpost, dst: Outpost): LineInfo {
        const r = OutpostElement.radius;

        let theta = Math.atan2(dst.y - src.y, dst.x - src.x);
        theta = theta < 0 ? theta + 2 * Math.PI : theta;

        const srcLine = {
            x: src.x + r * (1 + Math.cos(theta)),
            y: src.y + r * (1 + Math.sin(theta))
        };

        const dstLine = {
            x: dst.x + r * (1 - Math.cos(theta)),
            y: dst.y + r * (1 - Math.sin(theta))
        };

        const stage = {
            x: Math.min(src.x, dst.x),
            y: Math.min(src.y, dst.y)
        };

        return { theta, src: srcLine, dst: dstLine, stage };
    }

    private static getSubmarineInfo(lineInfo: LineInfo): SubmarineInfo {
        const src = {
            x: lineInfo.src.x - lineInfo.stage.x - 6 * Math.sin(lineInfo.theta),
            y: lineInfo.src.y - lineInfo.stage.y + 6 * Math.cos(lineInfo.theta)
        };

        const dst = {
            x: Math.abs(lineInfo.dst.x - lineInfo.stage.x - 40 * Math.cos(lineInfo.theta)),
            y: Math.abs(lineInfo.dst.y - lineInfo.stage.y - 40 * Math.sin(lineInfo.theta))
        };

        const rotation = lineInfo.theta - (Math.PI / 2);

        return { src, dst, rotation };
    }

    static GENERATE_SUBMARINE_SPRITE(color: number): PIXI.Texture {
        const ellipse = new PIXI.Graphics();
        ellipse.beginFill(color);
        ellipse.drawEllipse(6, 20, 6, 20);
        ellipse.endFill();

        return ellipse.generateCanvasTexture();
    }

    animate(tick: number) {
        const d = this.drawable();

        // TODO: make this some sort of pending "back-and-forth" animation
        if (d.endTick === 0) {
            return;
        }

        const delta = Math.min(tick, d.endTick) - Math.min(d.endTick, Math.max(this.prevTick, d.startTick));
        this.submarine.x += delta * UnitElement.speed * Math.cos(this.lineInfo.theta);
        this.submarine.y += delta * UnitElement.speed * Math.sin(this.lineInfo.theta);

        this.prevTick = tick;
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    SubmarineTextures[color] = UnitElement.GENERATE_SUBMARINE_SPRITE(color);
});
