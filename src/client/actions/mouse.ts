import { Action, Coordinates } from './action';

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
