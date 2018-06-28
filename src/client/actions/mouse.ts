import { Action, Coordinates } from '../../action';

export enum MouseActionType {
    MOUSE_CLICK = 'MOUSE_CLICK',
    MOUSE_WHEEL = 'MOUSE_WHEEL'
}

export const MouseAction = {
    click: (point: Coordinates): Action<Coordinates> => {
        return {
            type: MouseActionType.MOUSE_CLICK,
            payload: point
        };
    },

    wheel: (ev: WheelEvent): Action<WheelEvent> => {
        return {
            type: MouseActionType.MOUSE_WHEEL,
            payload: ev
        };
    }
};
