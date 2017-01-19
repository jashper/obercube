import { Action } from './action';

export const MouseActionType = {
    MOUSE_WHEEL: 'MOUSE_WHEEL'
};

export const MouseAction = {
    wheel: (ev: WheelEvent): Action<WheelEvent> => {
        return {
            type: MouseActionType.MOUSE_WHEEL,
            payload: ev
        };
    }
};
