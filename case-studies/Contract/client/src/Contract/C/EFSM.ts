// EFSM.ts

// ======
// States
// ======

export enum SendState {
    S4 = 'S4', S2 = 'S2', S0 = 'S0',
};

export enum ReceiveState {
    S1 = 'S1', S5 = 'S5',
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