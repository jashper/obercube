import { Action, User } from '../../action';

export const UserActionType = {
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    JOIN_MATCH: 'JOIN_MATCH'
};

export interface JoinMatchInfo {
    userId: number;
    matchId: number;
}

export const UserAction = {
    login: (id: number): Action<number> => {
        return {
            type: UserActionType.USER_LOGIN,
            payload: id
        };
    },

    logout: (user: User): Action<User> => {
        return {
            type: UserActionType.USER_LOGOUT,
            payload: user
        };
    },

    joinMatch: (info: JoinMatchInfo): Action<JoinMatchInfo> => {
        return {
            type: UserActionType.JOIN_MATCH,
            payload: info
        };
    }
};
