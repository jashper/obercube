import { Coordinates, Unit, Outpost } from '../../action';
import Constants from '../../constants';
import { GameStateRecord } from '../state/game';

export interface LineInfo {
    theta: number;
    src: Coordinates;
    dst: Coordinates;
    stage: Coordinates;
}

export interface SubmarineInfo {
    src: Coordinates;
    dst: Coordinates;
    rotation: number;
}

export class UnitElementInfo {
    static speed = 1.25; // distance / tick

    static GET_END_TICK(drawable: Unit, game: GameStateRecord, startTick: number): number {
        const src = game.outposts.get(drawable.src as number);
        const dst = game.outposts.get(drawable.dst as number);

        const lineInfo = UnitElementInfo.GET_LINE_INFO(src, dst);
        const subInfo = UnitElementInfo.GET_SUBMARINE_INFO(lineInfo);

        const distance = Math.sqrt(
            Math.pow((subInfo.src.x - subInfo.dst.x), 2) +
            Math.pow((subInfo.src.y - subInfo.dst.y), 2)
        );
        return startTick + (distance / UnitElementInfo.speed) + 1;
    }

    static GET_LINE_INFO(src: Outpost, dst: Outpost): LineInfo {
        const r = Constants.OUTPOST_RADIUS;

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

    static GET_SUBMARINE_INFO(lineInfo: LineInfo): SubmarineInfo {
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
}
