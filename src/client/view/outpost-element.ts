import * as PIXI from 'pixi.js';

import { Dispatch, Outpost } from '../../action';
import Constants from '../../constants';
import { SpawnAction } from '../actions/spawn';
import { StoreRecords } from '../state/reducers';
import { ViewElement } from './view-element';

const OutpostTextures: {[key: number]: PIXI.Texture} = {};

export class OutpostElement extends ViewElement {
    static rotation = 3 * (Math.PI / 180);

    private outpost: PIXI.Sprite;
    private unitLabel: PIXI.Text;

    static unitLabelStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        fill: '#ffffff'
    })

    constructor(readonly drawable: () => Outpost,
                readonly state: () => StoreRecords,
                readonly dispatch: Dispatch
    ) {
        super(drawable, state, dispatch);

        const d = this.drawable();
        const r = Constants.OUTPOST_RADIUS;

        this.stage.x = d.x;
        this.stage.y = d.y;

        const color = Constants.COLOR_MAP.get(d.playerId)!;
        this.outpost = new PIXI.Sprite(OutpostTextures[color]);
        this.outpost.x += r;
        this.outpost.y += r + Constants.OUTPOST_TEXT_BUFFER;
        this.outpost.pivot.set(r, r);
        this.stage.addChild(this.outpost);

        this.unitLabel = new PIXI.Text(`${drawable().unitCount}`, OutpostElement.unitLabelStyle);
        this.unitLabel.x += 20;
        this.unitLabel.anchor.set(0.5);
        this.stage.addChild(this.unitLabel);

        this.maxBounds = this.stage.getLocalBounds();
    }

    static GENERATE_SPRITE(color: number): PIXI.Texture {
        const r = Constants.OUTPOST_RADIUS;

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

    animate(tick: number) {
        super.animate(tick);

        this.outpost.rotation += OutpostElement.rotation;
        this.unitLabel.text = `${this.drawable().unitCount}`;
    }

    onClick(activeId: number, tick: number) {
        const id = this.drawable().id;
        if (activeId === 0) {
            return id;
        } else if (activeId !== id) {
            this.actionQueue.push(SpawnAction.unit({
                id: 0,
                src: activeId,
                dst: id,
                startTick: 0,
                endTick: 0
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
