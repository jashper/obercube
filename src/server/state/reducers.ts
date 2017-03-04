import { combineReducers } from 'redux';

import { match, MatchStateRecord } from './match';
import { user, UserStateRecord } from './user';

export const reducers = combineReducers<StoreRecords>({
    match,
    user
});

export interface StoreRecords {
    match: MatchStateRecord;
    user: UserStateRecord;
}
