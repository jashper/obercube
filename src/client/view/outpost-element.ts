import { Outpost } from '../actions/action';
import Constants from '../constants';
import { ViewElement } from './view-element-grid';

interface InnerCircle {
    circle: PIXI.Graphics;
    theta: number;
}

export class OutpostElement implements ViewElement {
    readonly drawable: Outpost;
    readonly stage = new PIXI.Container();

    private innerCircles: InnerCircle[] = [];

    constructor(outpost: Outpost) {
        this.drawable = outpost;
        this.init();
    }

    private init() {
        let circle = new PIXI.Graphics();
        circle.beginFill(this.drawable.color);
        circle.drawCircle(0, 0, 200);
        circle.endFill();
        this.stage.addChild(circle);

        circle = new PIXI.Graphics();
        circle.beginFill(Constants.BACKGROUND_COLOR);
        circle.drawCircle(0, 0, 155);
        circle.endFill();
        this.stage.addChild(circle);

        circle = new PIXI.Graphics();
        circle.beginFill(this.drawable.color);
        circle.drawCircle(0, 0, 70);
        circle.endFill();
        this.stage.addChild(circle);

        for (let i = 0; i < 360; i += 45) {
            circle = new PIXI.Graphics();
            circle.beginFill(this.drawable.color);
            circle.drawCircle(0, 0, 20);
            circle.endFill();
            this.stage.addChild(circle);
            this.innerCircles.push({
                circle,
                theta: i
            });
        }

        this.stage.scale.set(0.10, 0.10);
        this.stage.x = this.drawable.x;
        this.stage.y = this.drawable.y;
    }

    animate() {
        this.innerCircles.forEach((c) => {
            c.theta += 3;
            c.circle.x = 110 * Math.cos(c.theta * (Math.PI / 180));
            c.circle.y = 110 * Math.sin(c.theta * (Math.PI / 180));
        });
    }
}
