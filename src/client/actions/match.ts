import { Action } from './action';

export interface MatchInfo {
    mapWidth: number;
    mapHeight: number;
}

export const MatchActionType = {
    NEW_MATCH: 'NEW_MATCH'
};

export const MatchAction = {
    new: (info: MatchInfo): Action<MatchInfo> => {
        return {
            type: MatchActionType.NEW_MATCH,
            payload: info
        };
    }
};
