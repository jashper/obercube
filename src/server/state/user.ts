import { Map } from 'immutable';
import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';

import { Action, User } from '../../action';
import { JoinMatchInfo, UserActionType } from '../actions/user';

interface UserState {
    active: Map<number, User>;
}
export interface UserStateRecord extends TypedRecord<UserStateRecord>, UserState {}

const defaultState = makeTypedFactory<UserState, UserStateRecord>({
    active: Map<number, User>()
});

export function user(state: UserStateRecord = defaultState(), action: Action<any>) {
    switch (action.type) {
        case UserActionType.USER_LOGIN:
        {
            const id = action.payload;
            const user: User = { id };

            return state.merge({ active: state.active.set(id, user) });
        }
        case UserActionType.USER_LOGOUT:
        {
            const user = action.payload as User;
            return state.merge({ active: state.active.remove(user.id) });
        }
        case UserActionType.JOIN_MATCH:
        {
            const info = action.payload as JoinMatchInfo;

            const userId = info.userId;
            const matchId = info.matchId;

            const user = state.active.get(userId);
            user.activeMatchId = matchId;

            return state.merge({ active: state.active.set(user.id, user) });
        }
        default:
            return state;
    }
}
