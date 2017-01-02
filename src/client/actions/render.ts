import { Action } from './action';

export const RenderActionType = {
    RENDER_OUTPOSTS: 'RENDER_OUTPOSTS'
};

export const RenderAction = {
    outposts: (): Action<any> => {
        return {
            type: RenderActionType.RENDER_OUTPOSTS,
            payload: null
        };
    }
};
