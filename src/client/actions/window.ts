import * as PIXI from 'pixi.js';

import { Action, Dimensions, RendererInfo } from './action';

export const WindowActionType = {
    WINDOW_RESIZE: 'WINDOW_RESIZE',
    WINDOW_START_ANIMATION: 'WINDOW_START_ANIMATION'
};

export const WindowAction = {
    resize: (dimensions: Dimensions): Action<Dimensions> => {
        return {
            type: WindowActionType.WINDOW_RESIZE,
            payload: dimensions
        };
    },

    startAnimation: (info: RendererInfo): Action<RendererInfo> => {
        return {
            type: WindowActionType.WINDOW_START_ANIMATION,
            payload: info
        };
    }
};
