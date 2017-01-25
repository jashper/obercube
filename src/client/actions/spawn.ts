import { Action, Coordinates } from './action';

export const SpawnActionType = {
    SPAWN_OUTPOST: 'SPAWN_OUTPOST',
    SPAWN_UNIT: 'SPAWN_UNIT'
};

export interface SpawnInfo {
    src: Coordinates;
    dst?: Coordinates;
    color: number;
}

export const SpawnAction = {
    outpost: (info: SpawnInfo): Action<SpawnInfo> => {
        return {
            type: SpawnActionType.SPAWN_OUTPOST,
            payload: info
        };
    },

    unit: (info: SpawnInfo): Action<SpawnInfo> => {
        return {
            type: SpawnActionType.SPAWN_UNIT,
            payload: info
        };
    }
};
