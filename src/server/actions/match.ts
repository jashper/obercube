// TODO: make a typying file for this library
import * as transit from 'transit-immutable-js';
const toJSON: (obj: any) => string = transit.toJSON;

import { Action, MapInfo, Outpost, Player } from '../../action';
import { GameStateRecord } from '../../client/state/game';

export interface MatchSetup {
    id: number;
    mapInfo: MapInfo;
    outposts: Outpost[];
}

export enum MatchActionType {
    GAME_STATE = 'GAME_STATE',
    NEW_MATCH = 'NEW_MATCH',
    NEW_PLAYER = 'NEW_PLAYER'
}

export const MatchAction = {
    newMatch: (match: MatchSetup): Action<MatchSetup> => {
        return {
            type: MatchActionType.NEW_MATCH,
            payload: match
        };
    },

    newPlayer: (player: Player): Action<Player> => {
        return {
            type: MatchActionType.NEW_PLAYER,
            payload: player
        };
    },

    state: (playerId: number, state: GameStateRecord): Action<string> => {
        return {
            type: MatchActionType.GAME_STATE,
            payload: toJSON({
                matchId: state.matchId,
                playerId,
                mapInfo: state.mapInfo,
                players: state.players,
                outposts: state.outposts,
                units: state.units
            })
        };
    }
};
