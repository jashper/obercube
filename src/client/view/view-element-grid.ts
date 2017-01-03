import * as PIXI from 'pixi.js';

import { Drawable } from '../actions/action';

export interface ElementVisibility {
    excluded?: Set<number>;
    included?: Set<number>;
}

export interface ViewElement {
    readonly drawable: Drawable;
    readonly stage: PIXI.Container;
    readonly animate: () => void;
}

export class ViewElementGrid {
    private readonly binSize: number;

    private mapWidth: number;
    private mapHeight: number;
    private viewWidth: number;
    private viewHeight: number;
    private x: number;
    private y: number;
    private binsPerRow: number;

    private bins = new Map<number, Set<number>>();
    private visibleBins = new Set<number>();

    constructor(binSize: number) {
        this.binSize = binSize;
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
        visibleBins.forEach((bin) => this.visibleBins.add(bin));
    }

    private resetBins() {
        const area = this.mapWidth * this.mapHeight;
        const binCount = area / (this.binSize * this.binSize);

        this.bins.clear();
        this.visibleBins.clear();

        for (let i = 0; i < binCount; ++i) {
            this.bins.set(i, new Set<number>());
        }
    }

    insert(e: ViewElement): ElementVisibility {
        let isVisible = false;
        const id = e.drawable.id;

        const bins = this.getDrawableBins(e);
        bins.forEach((bin) => {
            (this.bins.get(bin) as Set<number>).add(id);

            // check if this bin is visible
            if (!isVisible && this.visibleBins.has(bin)) {
                isVisible = true;
            }
        });

        return isVisible ? { included: new Set([id]) } : {};
    }

    remove(e: ViewElement): ElementVisibility {
        let isVisible = false;
        const id = e.drawable.id;

        const bins = this.getDrawableBins(e);
        bins.forEach((bin) => {
            (this.bins.get(bin) as Set<number>).delete(id);

            // check if this bin is visible
            if (!isVisible && this.visibleBins.has(bin)) {
                isVisible = true;
            }
        });

        return isVisible ? { excluded: new Set([id]) } : {};
    }

    private getDrawableBins(e: ViewElement) {
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
