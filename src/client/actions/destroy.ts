import { Action } from '../../action';

export const DestroyActionType = {
    DESTROY_UNIT: 'DESTROY_UNIT'
};

export const DestroyAction = {
    unit: (id: number): Action<number> => {
        return {
            type: DestroyActionType.DESTROY_UNIT,
            payload: id
        };
    }
};
