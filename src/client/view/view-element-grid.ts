import * as PIXI from 'pixi.js';

import { Drawable } from '../actions/action';

export class ViewElement {
    readonly id: number;
    readonly drawable: Drawable;
    readonly stage = new PIXI.Container();

    constructor(drawable: Drawable) {
        this.id = drawable.id;
        this.drawable = drawable;
    }
}

export interface ElementVisibility {
    excluded?: Set<number>;
    included?: Set<number>;
}

export class ViewElementGrid<T extends ViewElement> {
    private readonly binSize: number;

    private mapWidth: number;
    private mapHeight: number;
    private viewWidth: number;
    private viewHeight: number;
    private x: number;
    private y: number;
    private binsPerRow: number;

    private elements = new Map<number, T>();
    private bins = new Map<number, Set<number>>();
    private isVisible = new Set<number>(); // bins that are visible

    constructor(binSize: number) {
        this.binSize = binSize;
    }

    getElement(id: number) {
        return this.elements.get(id);
    }

    init(mapWidth: number, mapHeight: number,
         viewWidth: number, viewHeight: number,
         x: number, y: number
    ) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.binsPerRow = this.mapWidth / this.binSize;

        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.x = x;
        this.y = y;

        this.resetBins();

        // set the initially visible bins
        const visibleBins = this.getContainingBins(x, y, viewWidth, viewHeight);
        visibleBins.forEach((bin) => this.isVisible.add(bin));
    }

    private resetBins() {
        const area = this.mapWidth * this.mapHeight;
        const binCount = area / (this.binSize * this.binSize);

        this.elements.clear();
        this.bins.clear();
        this.isVisible.clear();

        for (let i = 0; i < binCount; ++i) {
            this.bins.set(i, new Set<number>());
        }
    }

    insert(e: T): ElementVisibility {
        let isVisible = false;
        this.elements.set(e.id, e);

        const bins = this.getDrawableBins(e);
        bins.forEach((bin) => {
            (this.bins.get(bin) as Set<number>).add(e.id);

            // check if this bin is visible
            if (!isVisible && this.isVisible.has(bin)) {
                isVisible = true;
            }
        });

        return isVisible ? { included: new Set([e.id]) } : {};
    }

    remove(e: T): ElementVisibility {
        let isVisible = false;
        this.elements.delete(e.id);

        const bins = this.getDrawableBins(e);
        bins.forEach((bin) => {
            (this.bins.get(bin) as Set<number>).delete(e.id);

            // check if this bin is visible
            if (!isVisible && this.isVisible.has(bin)) {
                isVisible = true;
            }
        });

        return isVisible ? { excluded: new Set([e.id]) } : {};
    }

    private getDrawableBins(e: T) {
        const bounds = e.stage.getBounds();
        const { width, height } = bounds;

        // calculate top-left corner
        let { x, y } = e.drawable;
        x -= width / 2;
        y -= height / 2;

        const xMax = x + width;
        const yMax = y + height;

        // drawables can have negative coordinates if the initial offset/center
        // of it's stage is at (0,0)
        x = Math.max(x, 0);
        y = Math.max(y, 0);

        return this.getContainingBins(x, y, xMax, yMax);
    }

    // Gets the bins that a rectangular selection with top-left corner (x, y) occupies
    // (note: all args must be > 0)
    private getContainingBins(x: number, y: number, width: number, height: number) {
        const bins = new Set<number>();
        for (let dx = x; dx < width; dx += this.binSize) {
            for (let dy = y; dy < height; dy += this.binSize) {
                bins.add(this.coordinatesToBin(dx, dy));
            }
        }

        return bins;
    }

    private coordinatesToBin(x: number, y: number) {
        return Math.floor(x / this.binSize) +
            Math.floor(y / this.binSize) * this.binsPerRow;
    }
}
