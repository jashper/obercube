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
    private width = 0;
    private height = 0;

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
        const excluded = new Set<number>();
        const included = new Set<number>();

        // get the newly visible bins
        const newBins = this.getContainingBins(x, y, width, height);

        newBins.forEach((bin) => {
            (this.bins.get(bin) as Set<number>).forEach((id) => {
                included.add(id);
            });
        });

        this.visibleBins.forEach((bin) => {
            if (!newBins.has(bin)) {
                (this.bins.get(bin) as Set<number>).forEach((id) => {
                    if (!included.has(id)) {
                        excluded.add(id);
                    }
                });
            }
        });

        this.visibleBins = newBins;

        excluded.forEach((id) => {
            const e = this.elements.get(id) as ViewElement;
            e.stage.visible = false;
            this.visibleElements.delete(id);
        });

        included.forEach((id) => {
            if (!this.visibleElements.has(id)) {
                const e = this.elements.get(id) as ViewElement;
                e.stage.visible = true;
                this.visibleElements.add(id);
            }
        });
    }

    insert(e: ViewElement) {
        const id = e.drawable.id;
        const { x, y } = e.drawable;
        const { width, height } = e.stage.getBounds();

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
        const { x, y } = e.drawable;
        const { width, height } = e.stage.getBounds();

        this.stage.removeChild(e.stage);
        this.elements.delete(id);

        this.getContainingBins(x, y, width, height).forEach((bin) => {
            (this.bins.get(bin) as Set<number>).delete(e.drawable.id);
        });

        this.visibleElements.delete(id);
    }

    private isElementVisible(e: ViewElement) {
        let { x, y } = e.drawable;
        const { width, height } = e.stage.getBounds();

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

    // resize(width: number, height: number) {
    //     const xMin = this.x + this.width;
    //     const xMax = this.x + width;
    //     const yMin = this.y + this.height;
    //     const yMax = this.y + height;

    //     const excluded = this.stretchView(xMin, xMax, yMin, yMax);

    //     this.width = width;
    //     this.height = height;

    //     excluded.forEach((id) => {
    //         const e = this.elements.get(id) as ViewElement;
    //         if (!this.isElementVisible(e)) {
    //             e.stage.visible = false;
    //             this.visibleElements.delete(id);
    //         }
    //     });
    // }

    // private stretchView(xMin: number, xMax: number, yMin: number, yMax: number) {
    //     const excluded = new Set<number>();

    //     let delta = xMax - xMin;
    //     if (delta > 0) {
    //         this.addVisibleBins(xMin, xMax, this.roundToBin(this.y), yMax);
    //         if (xMax % this.binSize !== 0) {
    //             this.addVisibleBins(this.roundToBin(xMax), xMax, this.roundToBin(this.y), yMax);
    //         }
    //     } else if (delta < 0) {
    //         this.removeVisibleBins(xMax, xMin, this.roundToBin(this.y), yMax, excluded);
    //         if (xMin % this.binSize !== 0) {
    //             this.removeVisibleBins(xMax, this.roundToBin(xMin), this.roundToBin(this.y), yMax, excluded);
    //         }
    //     }

    //     delta = yMax - yMin;
    //     if (delta > 0) {
    //         this.addVisibleBins(this.roundToBin(this.x), xMin, yMin, yMax);
    //         if (yMax % this.binSize !== 0) {
    //             this.addVisibleBins(this.roundToBin(this.x), xMin, this.roundToBin(yMax), yMax);
    //         }
    //     } else if (delta < 0) {
    //         this.removeVisibleBins(this.roundToBin(this.x), xMin, yMax, yMin, excluded);
    //         if (yMin % this.binSize !== 0) {
    //             this.removeVisibleBins(this.roundToBin(this.x), xMin, yMax, this.roundToBin(yMin), excluded);
    //         }
    //     }

    //     return excluded;
    // }

    // private addVisibleBins(xMin: number, xMax: number, yMin: number, yMax: number) {
    //     for (let x = xMin; x < Math.min(xMax, this.mapWidth); x += this.binSize) {
    //         for (let y = yMin; y < Math.min(yMax, this.mapHeight); y += this.binSize) {
    //             const binId = this.coordinatesToBin(x, y);
    //             this.visibleBins.add(binId);

    //             const bin = this.bins.get(binId) as Bin;
    //             bin.forEach((id) => {
    //                 if (!this.visibleElements.has(id)) {
    //                     this.visibleElements.add(id);
    //                     const e = this.elements.get(id) as ViewElement;
    //                     e.stage.visible = true;
    //                 }
    //             });
    //         }
    //     }
    // }

    // private removeVisibleBins(xMin: number, xMax: number, yMin: number, yMax: number, excluded: Set<number>) {
    //     for (let x = Math.min(xMax, this.mapWidth); x >= xMin; x -= this.binSize) {
    //         for (let y = Math.min(yMax, this.mapHeight); y >= yMin; y -= this.binSize) {
    //             const binId = this.coordinatesToBin(x, y);
    //             this.visibleBins.delete(binId);

    //             const bin = this.bins.get(binId) as Bin;
    //             bin.forEach((id) => excluded.add(id));
    //         }
    //     }
    // }
}
