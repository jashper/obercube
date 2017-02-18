// TODO: make a typying file for this library
import * as transit from 'transit-immutable-js';
const toJSON: (obj: any) => string = transit.toJSON;

import { Action, MapInfo, Outpost } from '../../action';
import { GameStateRecord } from '../../client/state/game';

export interface Match {
    mapInfo: MapInfo;
    outposts: Outpost[];
}

export const MatchActionType = {
    GAME_STATE: 'GAME_STATE',
    NEW_MATCH: 'NEW_MATCH'
};

export const MatchAction = {
    new: (info: Match): Action<Match> => {
        return {
            type: MatchActionType.NEW_MATCH,
            payload: info
        };
    },

    state: (state: GameStateRecord): Action<string> => {
        return {
            type: MatchActionType.GAME_STATE,
            payload: toJSON({
                mapInfo: state.mapInfo,
                outposts: state.outposts,
                units: state.units
            })
        };
    }
};
