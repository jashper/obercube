import { Map } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { Action, User } from '../../action';
import { MatchActionType, MatchSetup } from '../actions/match';
import { UserActionType, JoinMatchInfo } from '../actions/user';

export interface Match {
    id: number;
    users: Set<number>; // TODO: make this immutable?
}

interface MatchState {
    idMap: Map<number, Match>;
}
export interface MatchStateRecord extends TypedRecord<MatchStateRecord>, MatchState {}

const defaultState = makeTypedFactory<MatchState, MatchStateRecord>({
    idMap: Map<number, Match>()
});

export function match(state: MatchStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case MatchActionType.NEW_MATCH:
        {
            const id = (action.payload as MatchSetup).id;
            const match = { id, users: new Set<number>() };

            return state.merge({ idMap: state.idMap.set(id, match) });
        }
        case UserActionType.JOIN_MATCH:
        {
            const info = action.payload as JoinMatchInfo;

            const userId = info.userId;
            const matchId = info.matchId;

            const match = state.idMap.get(matchId);
            match.users.add(userId);

            return state.merge({ idMap: state.idMap.set(match.id, match) });
        }
        case UserActionType.USER_LOGOUT:
        {
            const user = action.payload as User;

            const match = state.idMap.get(user.activeMatchId!);
            match.users.delete(user.id);

            return state.merge({ idMap: state.idMap.set(match.id, match) });
        }
        default:
            return state;
    }
}
