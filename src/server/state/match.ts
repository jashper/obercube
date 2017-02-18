import { OrderedMap } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, Outpost } from '../../action';
import { GameStateRecord, defaultGameState } from '../../client/state/game';
import { MatchActionType } from '../actions/match';
import Constants from '../../constants';

interface MatchState {
    games: OrderedMap<number, GameStateRecord>;
}
export interface MatchStateRecord extends TypedRecord<MatchStateRecord>, MatchState {}

const defaultState = makeTypedFactory<MatchState, MatchStateRecord>({
    games: OrderedMap<number, GameStateRecord>()
});

export function match(state: MatchStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case MatchActionType.NEW_MATCH:
            const id = Constants.generateId();
            let game = defaultGameState();

            game = game.merge({
                mapInfo: action.payload.mapInfo
            });

            (action.payload.outposts as Outpost[]).forEach((o) => {
                 game = game.merge({
                     outposts: game.outposts.set(o.id, o)
                 });
            });

            return state.merge({ games: state.games.set(id, game) });
        default:
            return state;
    }
}
