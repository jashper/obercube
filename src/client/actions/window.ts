import * as PIXI from 'pixi.js';

import { Action, Dimensions } from './action';

export const WindowActionType = {
    WINDOW_RESIZE: 'WINDOW_RESIZE',
    WINDOW_RESCALE: 'WINDOW_RESCALE',
    WINDOW_START_ANIMATION: 'WINDOW_START_ANIMATION',
    WINDOW_RENDER: 'WINDOW_RENDER'
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
    },

    startAnimation: (stage: PIXI.Container): Action<PIXI.Container> => {
        return {
            type: WindowActionType.WINDOW_START_ANIMATION,
            payload: stage
        };
    },

    render: (): Action<null> => {
        return {
            type: WindowActionType.WINDOW_RENDER,
            payload: null
        };
    }
};
