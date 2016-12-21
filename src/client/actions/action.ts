export interface Action<P> {
    type: string;
    payload: P;
}

export type Dispatch = <T>(action: Action<T>) => void;
