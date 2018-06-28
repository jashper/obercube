import { combineReducers } from 'redux';

import { match, MatchStateRecord } from './match';
import { user, UserStateRecord } from './user';

export const reducers = combineReducers<ServerStore>({
    match,
    user
});

export interface ServerStore {
    match: MatchStateRecord;
    user: UserStateRecord;
}
