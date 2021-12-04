import {
    FromPromise,
    MaybePromise,
} from "./Utility";

import {
    Cancellation,
} from "./Cancellation";

import {
    StateTransitionHandler,
    SendStateHandler,
    MessageHandler,
    ReceiveStateHandler,
} from "./Runtime";

export namespace Role {
    type Self = "Svr";

    // Constant value for value comparisons
    export const Self: Self = "Svr";

    export enum Peers {
        Client = "Client",
    };

    export type All = Self | Peers;

    export type PeersToMapped<Value> = {
        [Role in Peers]: Value
    };
};

export namespace Message {

    export interface S1_RES_payload {
        res: number,
    }
    export interface S1_RES {
        label: "RES",
        payload: S1_RES_payload
    };

    export type S1 = | S1_RES;

    export interface S0_ADD_payload {
        x: number,
        y: number,
    }
    export interface S0_ADD {
        label: "ADD",
        payload: S0_ADD_payload
    };
    export interface S0_QUIT_payload {
    }
    export interface S0_QUIT {
        label: "QUIT",
        payload: S0_QUIT_payload
    };

    export type S0 = | S0_ADD | S0_QUIT;


    export interface Channel {
        role: Role.All;
        label: string;
        payload: any;
    };

    export const serialise = <T>(obj: T) => JSON.stringify(obj);
    export const deserialise = <T>(message: any) => JSON.parse(message) as T;

};

export namespace Handler {
    export type S1 =
        MaybePromise<
            | ["RES", Message.S1_RES['payload'], State.S0, Role.Peers.Client]

        >;

    export interface S0 {
        "ADD": (Next: typeof Factory.S1, payload: Message.S0_ADD['payload']) => MaybePromise<State.S1>,
        "QUIT": (Next: typeof Factory.S2, payload: Message.S0_QUIT['payload']) => MaybePromise<State.S2>,

    };

};

export namespace State {

    interface ISend {
        readonly type: 'Send';
        performSend(next: StateTransitionHandler, cancel: Cancellation, send: SendStateHandler): void;
    };

    interface IReceive {
        readonly type: 'Receive';
        prepareReceive(next: StateTransitionHandler, cancel: Cancellation, register: ReceiveStateHandler): void;
    };

    interface ITerminal {
        readonly type: 'Terminal';
    };

    export type Type = ISend | IReceive | ITerminal;

    export class S1 implements ISend {
        readonly type: 'Send' = 'Send';
        constructor(public handler: Handler.S1) { }

        performSend(next: StateTransitionHandler, cancel: Cancellation, send: SendStateHandler) {
            const thunk = ([label, payload, successor, role]: FromPromise<Handler.S1>) => {
                send(role, label, payload);
                return next(successor);
            };

            if (this.handler instanceof Promise) {
                this.handler.then(thunk).catch(cancel);
            } else {
                try {
                    thunk(this.handler);
                } catch (error) {
                    cancel(error);
                }
            }
        }
    };


    export class S0 implements IReceive {
        readonly type: 'Receive' = 'Receive';
        constructor(public handler: Handler.S0) { }

        prepareReceive(next: StateTransitionHandler, cancel: Cancellation, register: ReceiveStateHandler) {
            const onReceive = (message: any) => {
                const parsed = JSON.parse(message) as Message.S0;
                switch (parsed.label) {
                    case "ADD": {
                        try {
                            const successor = this.handler[parsed.label](Factory.S1, parsed.payload);
                            if (successor instanceof Promise) {
                                successor.then(next).catch(cancel);
                            } else {
                                next(successor);
                            }
                        } catch (error) {
                            cancel(error);
                        }
                        return;
                    }
                    case "QUIT": {
                        try {
                            const successor = this.handler[parsed.label](Factory.S2, parsed.payload);
                            if (successor instanceof Promise) {
                                successor.then(next).catch(cancel);
                            } else {
                                next(successor);
                            }
                        } catch (error) {
                            cancel(error);
                        }
                        return;
                    }

                }
            };

            register(Role.Peers.Client, onReceive);
        }
    };



    export class S2 implements ITerminal {
        readonly type: 'Terminal' = 'Terminal';
    };


};

export namespace Factory {


    type S1_RES =
        | [Message.S1_RES['payload'], (Next: typeof S0) => State.S0]
        | [Message.S1_RES['payload'], State.S0]
        ;

    function S1_RES(
        payload: Message.S1_RES['payload'],
        generateSuccessor: (Next: typeof S0) => State.S0
    ): State.S1;
    function S1_RES(
        payload: Message.S1_RES['payload'],
        succ: State.S0
    ): State.S1;
    function S1_RES(...args: S1_RES) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S0);
            return new State.S1(["RES", payload, successor, Role.Peers.Client]);
        } else {
            const [payload, successor] = args;
            return new State.S1(["RES", payload, successor, Role.Peers.Client]);
        }
    }


    export const S1 = {
        RES: S1_RES,

    };

    export function S0(handler: Handler.S0) {
        return new State.S0(handler);
    };


    export const Initial = S0;

    export const S2 = () => new State.S2();
    export const Terminal = S2;

};