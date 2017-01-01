import { Action, Coordinates } from './action';

export const SpawnActionType = {
    SPAWN_OUTPOST: 'SPAWN_OUTPOST'
};

export const SpawnAction = {
    spawn: (location: Coordinates): Action<Coordinates> => {
        return {
            type: SpawnActionType.SPAWN_OUTPOST,
            payload: location
        };
    }
};
