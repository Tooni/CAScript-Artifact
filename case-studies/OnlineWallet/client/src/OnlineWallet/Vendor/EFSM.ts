// EFSM.ts

// ======
// States
// ======

export enum SendState {
    S1 = 'S1',
};

export enum ReceiveState {
    S0 = 'S0', S2 = 'S2',
};

export enum TerminalState {
    S3 = 'S3',
};

export type State = ReceiveState | SendState | TerminalState;

// ===========
// Type Guards
// ===========

export function isReceiveState(state: State): state is ReceiveState {
    return (Object.values(ReceiveState) as Array<State>).includes(state)
}

export function isSendState(state: State): state is SendState {
    return (Object.values(SendState) as Array<State>).includes(state)
}

export function isTerminalState(state: State): state is TerminalState {
    return (Object.values(TerminalState) as Array<State>).includes(state)
}