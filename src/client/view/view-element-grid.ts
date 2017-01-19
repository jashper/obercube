import * as PIXI from 'pixi.js';

import { Drawable } from '../actions/action';

export interface ViewElement {
    readonly drawable: Drawable;
    readonly stage: PIXI.Container;
    readonly animate: () => void;
}

type Bin = Set<number>;

export class ViewElementGrid {
    private readonly binSize: number;

    private mapWidth: number;
    private mapHeight: number;
    private binsPerRow: number;

    private x = 0;
    private y = 0;
    private width = 0; // adjusted to scale
    private height = 0; // adjusted to scale

    private bins = new Map<number, Bin>();
    private visibleBins = new Set<number>();

    private elements = new Map<number, ViewElement>();
    private visibleElements = new Set<number>();

    stage: PIXI.Container;

    get activeElements() {
        return Array.from(this.visibleElements.values())
                .map((id) => this.elements.get(id) as ViewElement);
    }

    constructor(binSize: number) {
        this.binSize = binSize;
    }

    init(mapWidth: number, mapHeight: number) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.binsPerRow = this.mapWidth / this.binSize;

        this.resetBins();
    }

    private resetBins() {
        const area = this.mapWidth * this.mapHeight;
        const binCount = area / (this.binSize * this.binSize);

        this.bins.clear();
        this.visibleBins.clear();
        this.elements.clear();
        this.visibleElements.clear();

        for (let i = 0; i < binCount; ++i) {
            this.bins.set(i, new Set<number>());
        }
    }

    pan(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.updateVisiblity(x, y, this.width, this.height);
    }

    zoom(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.updateVisiblity(x, y, width, height);
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.updateVisiblity(this.x, this.y, width, height);
    }

    private updateVisiblity(x: number, y: number, width: number, height: number) {
        // get the newly visible bins
        const buffer = 2 * this.binSize; // pre-render some of the bins outside of the viewport
        const newBins = this.getContainingBins(x - buffer, y - buffer, width + buffer, height + buffer);
        newBins.forEach((bin) => {
            (this.bins.get(bin) as Set<number>).forEach((id) => {
                const e = this.elements.get(id) as ViewElement;
                if (this.isElementVisible(e)) {
                    e.stage.visible = true;
                    this.visibleElements.add(id);
                }
            });
        });

        this.visibleBins.forEach((bin) => {
            if (!newBins.has(bin)) {
                (this.bins.get(bin) as Set<number>).forEach((id) => {
                    const e = this.elements.get(id) as ViewElement;
                    if (!this.isElementVisible(e)) {
                        e.stage.visible = false;
                        this.visibleElements.delete(id);
                    }
                });
            }
        });

        this.visibleBins = newBins;
    }

    insert(e: ViewElement) {
        const id = e.drawable.id;
        let { x, y } = e.drawable;
        let { width, height } = e.stage.getBounds();

        width /= this.stage.scale.x;
        height /= this.stage.scale.y;
        x -= width / 2;
        y -= height / 2;

        this.stage.addChild(e.stage);
        this.elements.set(id, e);

        this.getContainingBins(x, y, width, height).forEach((bin) => {
            (this.bins.get(bin) as Set<number>).add(e.drawable.id);
        });

        if (this.isElementVisible(e)) {
            this.visibleElements.add(id);
        } else {
            e.stage.visible = false;
        }
    }

    remove(e: ViewElement) {
        const id = e.drawable.id;
        let { x, y } = e.drawable;
        let { width, height } = e.stage.getBounds();

        width /= this.stage.scale.x;
        height /= this.stage.scale.y;
        x -= width / 2;
        y -= height / 2;

        this.stage.removeChild(e.stage);
        this.elements.delete(id);

        this.getContainingBins(x, y, width, height).forEach((bin) => {
            (this.bins.get(bin) as Set<number>).delete(e.drawable.id);
        });

        this.visibleElements.delete(id);
    }

    private isElementVisible(e: ViewElement) {
        let { x, y } = e.drawable;
        let { width, height } = e.stage.getBounds();

        width /= this.stage.scale.x;
        height /= this.stage.scale.y;
        x -= width / 2;
        y -= height / 2;

        return this.isPointVisible(x, y) || this.isPointVisible(x + width, y) ||
               this.isPointVisible(x, y + height) || this.isPointVisible(x + width, y + height);
    }

    private isPointVisible(x: number, y: number) {
        return (x > this.x) && (y > this.y) && (x < (this.x + this.width)) && (y < (this.y + this.height));
    }

    private getContainingBins(x: number, y: number, width: number, height: number) {
        const bins = new Set<number>();
        for (let dx = this.roundToBin(Math.max(x, 0)); dx < Math.min(x + width, this.mapWidth); dx += this.binSize) {
            for (let dy = this.roundToBin(Math.max(y, 0)); dy < Math.min(y + height, this.mapHeight); dy += this.binSize) {
                bins.add(this.coordinatesToBin(dx, dy));
            }
        }

        return bins;
    }

    private coordinatesToBin(x: number, y: number) {
        return Math.floor(x / this.binSize) +
            Math.floor(y / this.binSize) * this.binsPerRow;
    }

    private roundToBin(x: number) {
        return Math.floor(x / this.binSize) * this.binSize;
    }
}
