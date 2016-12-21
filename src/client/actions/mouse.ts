import { Action } from './action';

export class Coordinates {
    constructor(readonly x: number,
                readonly y: number) {}
}

export const MouseActionType = {
    SINGLE_CLICK: 'SINGLE_CLICK'
};

export const MouseAction = {
    click: (point: Coordinates): Action<Coordinates> => {
        return {
            type: MouseActionType.SINGLE_CLICK,
            payload: point
        };
    }
};
