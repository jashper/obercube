import { Action } from '../../action';
import { GameTickEvent } from '../../game-tick-engine';

export const GameTickActionType = {
    START_TICK: 'START_TICK',
    SYNCHRONIZE_TICK: 'SYNCHRONIZE_TICK',
    QUEUE_EVENT: 'QUEUE_EVENT'
};

export const GameTickAction = {
    start: (tick: number): Action<number> => {
        return {
            type: GameTickActionType.START_TICK,
            payload: tick
        };
    },

    synchronize: (tick: number): Action<number> => {
        return {
            type: GameTickActionType.SYNCHRONIZE_TICK,
            payload: tick
        };
    },

    queueEvent: (event: GameTickEvent): Action<GameTickEvent> => {
        return {
            type: GameTickActionType.QUEUE_EVENT,
            payload: event
        };
    }
};
