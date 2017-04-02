import * as PIXI from 'pixi.js';
import * as THREE from 'three';

import { Dispatch, Outpost } from '../../action';
import Constants from '../../constants';
import { SpawnAction } from '../actions/spawn';
import { StoreRecords } from '../state/reducers';
import { ViewElement } from './view-element';
import { METAL, DARK_METAL } from './scene-materials';

const OutpostTextures: {[key: number]: PIXI.Texture} = {};
const UnitCountTextures: {[key: number]: PIXI.Texture} = {};

export class OutpostElement extends ViewElement {
    static rotation = 3 * (Math.PI / 180);

    private outpost: PIXI.Sprite;

    private prevUnitCount = 0;
    private unitLabel: PIXI.Sprite;
    static unitLabelStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        fill: '#ffffff'
    });

    constructor(readonly drawable: () => Outpost,
                readonly state: () => StoreRecords,
                readonly dispatch: Dispatch
    ) {
        super(drawable, state, dispatch);

        const d = this.drawable();
        const r = Constants.OUTPOST_RADIUS;

        // this.stage.x = d.x;
        // this.stage.y = d.y;

        // const color = Constants.COLOR_MAP.get(d.playerId)!;
        // this.outpost = new PIXI.Sprite(OutpostTextures[color]);
        // this.outpost.x += r;
        // this.outpost.y += r + Constants.OUTPOST_TEXT_BUFFER;
        // this.outpost.pivot.set(r, r);
        // this.outpost.cacheAsBitmap = true;

        const buildingGeom = new THREE.BoxGeometry( r, r, r );
        const stack1Geom = new THREE.BoxGeometry( r / 5, r, r / 5 );
        const stack2Geom = new THREE.BoxGeometry( r / 8, r, r / 8 );
        const building = new THREE.Mesh( buildingGeom, METAL );
        const stack1 = new THREE.Mesh( stack1Geom, DARK_METAL );
        const stack2 = new THREE.Mesh( stack2Geom, DARK_METAL );
        building.position.y = r / 2;
        stack1.position.y = r * 2 / 2;
        stack1.position.x = -r * 2 / 10;
        stack1.position.z = -r * 2 / 10;
        stack2.position.y = r * 3 / 4;
        stack2.position.x = -r * 4 / 10;
        stack1.position.z = -r * 3 / 10;
        this.object.add(building);
        this.object.add(stack1);
        this.object.add(stack2);
        this.object.position.x = d.x;
        this.object.position.z = d.y;
        // this.object.rotateY(150 / 57.3);

        this.addUnitLabel(d.unitCount);

        // this.maxBounds = this.stage.getLocalBounds();
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

        const unitCount = this.drawable().unitCount;
        if (unitCount !== this.prevUnitCount) {
            // this.stage.removeChild(this.unitLabel);
            // this.addUnitLabel(unitCount);
        }
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

    private addUnitLabel(count: number) {
        this.unitLabel = new PIXI.Sprite(UnitCountTextures[count]);
        this.unitLabel.x += 20;
        this.unitLabel.anchor.set(0.5);

        this.prevUnitCount = count;
        // this.stage.addChild(this.unitLabel);
    }
}

Object.keys(Constants.COLORS).filter(k => typeof k === 'string').forEach(k => {
    const color: number = (Constants.COLORS[k as any] as any);
    OutpostTextures[color] = OutpostElement.GENERATE_SPRITE(color);
});

// TODO: !!! remove everything below, and use pre-rendered font textures instead !!!

const tempCanvas = new PIXI.CanvasRenderer();
const tempStage = new PIXI.Container();

for (let i = 0; i < 1000; ++i) {
    const tempText = new PIXI.Text(`${i}`, OutpostElement.unitLabelStyle);

    tempStage.addChild(tempText);
    tempCanvas.render(tempStage);

    UnitCountTextures[i] =  tempText.texture;
}
