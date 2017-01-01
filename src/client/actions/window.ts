import { Action, Dimensions } from './action';

export const WindowActionType = {
    WINDOW_RESIZE: 'WINDOW_RESIZE',
    WINDOW_RESCALE: 'WINDOW_RESCALE'
};

export const WindowAction = {
    resize: (dimensions: Dimensions): Action<Dimensions> => {
        return {
            type: WindowActionType.WINDOW_RESIZE,
            payload: dimensions
        };
    },

    rescale: (scale: number): Action<number> => {
        return {
            type: WindowActionType.WINDOW_RESCALE,
            payload: scale
        };
    }
};
