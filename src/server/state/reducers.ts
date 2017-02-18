import { combineReducers } from 'redux';

import { match, MatchStateRecord } from './match';

export const reducers = combineReducers<StoreRecords>({
    match
});

export interface StoreRecords {
    match: MatchStateRecord;
}
