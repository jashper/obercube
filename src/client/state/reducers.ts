import { Action, Dispatch } from '../../action';
import { game, GameStateRecord } from './game';
import { viewport, ViewportStateRecord, defaultViewportState } from './viewport';
import { websocket, WebSocketStateRecord } from './web-socket';

// Dispatch can only be used in an aync manner (i.e. don't call it directly in a reducer, schedule it instead)
export const reducers = (state: any = {}, action: Action<any>, dispatch: Dispatch) => {
    // all files in 'src/client/state/' must be included here
    const newState = {
        game: game(state.game, action),
        websocket: websocket(state.websocket, action),
        viewport: state.viewport || defaultViewportState()
    };

    // ensure that all updates happen before the viewport state is updated
    newState.viewport = viewport(newState, action, dispatch);

    return newState;
};

export interface StoreRecords {
    game: GameStateRecord;
    viewport: ViewportStateRecord;
    websocket: WebSocketStateRecord;
}
