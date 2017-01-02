import { Action } from './action';

export const SpawnActionType = {
    SPAWN_OUTPOST: 'SPAWN_OUTPOST'
};

export interface SpawnInfo {
    x: number;
    y: number;
    color?: number;
}

export const SpawnAction = {
    outpost: (info: SpawnInfo): Action<SpawnInfo> => {
        return {
            type: SpawnActionType.SPAWN_OUTPOST,
            payload: info
        };
    }
};
