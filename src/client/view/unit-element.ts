import * as PIXI from 'pixi.js';

import { Dispatch, Unit } from '../../action';
import Constants from '../../constants';
import { StoreRecords } from '../state/reducers';
import { LineInfo, SubmarineInfo, UnitElementInfo } from './unit-element-info';
import { ViewElement } from './view-element';

const SubmarineTextures: {[key: number]: PIXI.Texture} = {};

export class UnitElement extends ViewElement {
    private isCompleted = false;

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

        this.lineInfo = UnitElementInfo.GET_LINE_INFO(src, dst);
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

        this.subInfo = UnitElementInfo.GET_SUBMARINE_INFO(this.lineInfo);
        this.submarine.x = this.subInfo.src.x;
        this.submarine.y = this.subInfo.src.y;
        this.submarine.rotation = this.subInfo.rotation;
        this.stage.addChild(this.submarine);

        this.maxBounds = this.stage.getLocalBounds();
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

        // TODO: make this some sort of pending "back-and-forth" animation, while
        // waiting for the server to set the start and end ticks
        if (d.endTick === 0) {
            return;
        } else if (this.isCompleted) {
            this.stage.visible = false;
            return;
        }

        // determine how far along the submarine is from where it started
        const delta = this.getDelta(tick);

        const { x, y } = this.subInfo.src;
        this.submarine.x = x + delta * UnitElementInfo.speed * Math.cos(this.lineInfo.theta);
        this.submarine.y = y + delta * UnitElementInfo.speed * Math.sin(this.lineInfo.theta);

        // check to see if the submarine has reached the end of its motion;
        // mark as complete for now, in anticipation of the game-tick-engine dispatching DESTROY_UNIT => the
        // dispatch may occur before the following condition is met, if the client's clock is behind the server's clock
        if (delta === d.endTick - d.startTick) {
            this.isCompleted = true;
        }
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    SubmarineTextures[color] = UnitElement.GENERATE_SUBMARINE_SPRITE(color);
});
