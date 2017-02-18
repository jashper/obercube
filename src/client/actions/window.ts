import { Action, Dimensions, RendererInfo, Delta } from '../../action';

export const WindowActionType = {
    WINDOW_RESIZE: 'WINDOW_RESIZE',
    WINDOW_START_ANIMATION: 'WINDOW_START_ANIMATION',
    WINDOW_START_PAN: 'WINDOW_START_PAN',
    WINDOW_END_PAN: 'WINDOW_END_PAN'
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
    },

    startPan: (delta: Delta): Action<Delta> => {
        return {
            type: WindowActionType.WINDOW_START_PAN,
            payload: delta
        };
    },

    endPan: (): Action<null> => {
        return {
            type: WindowActionType.WINDOW_END_PAN,
            payload: null
        };
    }
};
