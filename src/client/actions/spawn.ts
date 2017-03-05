import { Action, Unit } from '../../action';
import IdGenerator from '../../id-generator';

export const SpawnActionType = {
    SPAWN_UNIT: 'SPAWN_UNIT'
};

export const SpawnAction = {
    unit: (info: Unit): Action<Unit> => {
        info.id = info.id > 0 ? info.id : IdGenerator.Next();

        return {
            type: SpawnActionType.SPAWN_UNIT,
            payload: info
        };
    }
};
