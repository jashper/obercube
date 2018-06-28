import { Action } from '../../action';

export enum GenerateActionType {
    GENERATE_UNITS = 'GENERATE_UNITS'
}

export const GenerateAction = {
    units: (): Action<null> => {
        return {
            type: GenerateActionType.GENERATE_UNITS,
            payload: null
        };
    }
};
