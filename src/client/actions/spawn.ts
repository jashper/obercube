import { Action, Unit } from '../../action';
import Constants from '../../constants';

export const SpawnActionType = {
    SPAWN_UNIT: 'SPAWN_UNIT'
};

export const SpawnAction = {
    unit: (info: Unit): Action<Unit> => {
        info.id = info.id > 0 ? info.id : Constants.generateId();

        return {
            type: SpawnActionType.SPAWN_UNIT,
            payload: info
        };
    }
};
