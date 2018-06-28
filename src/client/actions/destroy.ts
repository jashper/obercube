import { Action } from '../../action';

export enum DestroyActionType {
    DESTROY_UNIT = 'DESTROY_UNIT'
}

export const DestroyAction = {
    unit: (id: number): Action<number> => {
        return {
            type: DestroyActionType.DESTROY_UNIT,
            payload: id
        };
    }
};
