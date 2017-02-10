import { Action } from './action';

export const SpawnActionType = {
    SPAWN_OUTPOST: 'SPAWN_OUTPOST',
    SPAWN_UNIT: 'SPAWN_UNIT'
};

export interface OutpostSpawnInfo {
    x: number;
    y: number;
    color: number;
}

export interface UnitSpawnInfo {
    src: number; // id of the src Outpost
    dst: number; // id of the dest Outpost
    color: number;
}

export const SpawnAction = {
    outpost: (info: OutpostSpawnInfo): Action<OutpostSpawnInfo> => {
        return {
            type: SpawnActionType.SPAWN_OUTPOST,
            payload: info
        };
    },

    unit: (info: UnitSpawnInfo): Action<UnitSpawnInfo> => {
        return {
            type: SpawnActionType.SPAWN_UNIT,
            payload: info
        };
    }
};
