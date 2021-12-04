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
    type Self = "P";

    // Constant value for value comparisons
    export const Self: Self = "P";

    export enum Peers {
        C = "C",
    };

    export type All = Self | Peers;

    export type PeersToMapped<Value> = {
        [Role in Peers]: Value
    };
};

export namespace Message {

    export interface S5_confirm_payload {
    }
    export interface S5_confirm {
        label: "confirm",
        payload: S5_confirm_payload
    };

    export type S5 = | S5_confirm;

    export interface S1_accept_payload {
        confirmedPrice: number,
    }
    export interface S1_accept {
        label: "accept",
        payload: S1_accept_payload
    };
    export interface S1_reject_payload {
    }
    export interface S1_reject {
        label: "reject",
        payload: S1_reject_payload
    };
    export interface S1_counter_payload {
        counterPrice: number,
    }
    export interface S1_counter {
        label: "counter",
        payload: S1_counter_payload
    };

    export type S1 = | S1_accept | S1_reject | S1_counter;

    export interface S0_propose_payload {
        initialPrice: number,
    }
    export interface S0_propose {
        label: "propose",
        payload: S0_propose_payload
    };

    export type S0 = | S0_propose;

    export interface S4_counter_payload {
        newCounterPrice: number,
    }
    export interface S4_counter {
        label: "counter",
        payload: S4_counter_payload
    };
    export interface S4_reject_payload {
    }
    export interface S4_reject {
        label: "reject",
        payload: S4_reject_payload
    };
    export interface S4_accept_payload {
        confirmedPrice: number,
    }
    export interface S4_accept {
        label: "accept",
        payload: S4_accept_payload
    };

    export type S4 = | S4_counter | S4_reject | S4_accept;

    export interface S2_confirm_payload {
    }
    export interface S2_confirm {
        label: "confirm",
        payload: S2_confirm_payload
    };

    export type S2 = | S2_confirm;


    export interface Channel {
        role: Role.All;
        label: string;
        payload: any;
    };

    export const serialise = <T>(obj: T) => JSON.stringify(obj);
    export const deserialise = <T>(message: any) => JSON.parse(message) as T;

};

export namespace Handler {
    export type S5 =
        MaybePromise<
            | ["confirm", Message.S5_confirm['payload'], State.S3, Role.Peers.C]

        >;
    export type S1 =
        MaybePromise<
            | ["accept", Message.S1_accept['payload'], State.S2, Role.Peers.C]
            | ["reject", Message.S1_reject['payload'], State.S3, Role.Peers.C]
            | ["counter", Message.S1_counter['payload'], State.S4, Role.Peers.C]

        >;

    export interface S0 {
        "propose": (Next: typeof Factory.S1, payload: Message.S0_propose['payload']) => MaybePromise<State.S1>,

    };
    export interface S4 {
        "counter": (Next: typeof Factory.S1, payload: Message.S4_counter['payload']) => MaybePromise<State.S1>,
        "reject": (Next: typeof Factory.S3, payload: Message.S4_reject['payload']) => MaybePromise<State.S3>,
        "accept": (Next: typeof Factory.S5, payload: Message.S4_accept['payload']) => MaybePromise<State.S5>,

    };
    export interface S2 {
        "confirm": (Next: typeof Factory.S3, payload: Message.S2_confirm['payload']) => MaybePromise<State.S3>,

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

    export class S5 implements ISend {
        readonly type: 'Send' = 'Send';
        constructor(public handler: Handler.S5) { }

        performSend(next: StateTransitionHandler, cancel: Cancellation, send: SendStateHandler) {
            const thunk = ([label, payload, successor, role]: FromPromise<Handler.S5>) => {
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
                    case "propose": {
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

                }
            };

            register(Role.Peers.C, onReceive);
        }
    };
    export class S4 implements IReceive {
        readonly type: 'Receive' = 'Receive';
        constructor(public handler: Handler.S4) { }

        prepareReceive(next: StateTransitionHandler, cancel: Cancellation, register: ReceiveStateHandler) {
            const onReceive = (message: any) => {
                const parsed = JSON.parse(message) as Message.S4;
                switch (parsed.label) {
                    case "counter": {
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
                    case "reject": {
                        try {
                            const successor = this.handler[parsed.label](Factory.S3, parsed.payload);
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
                    case "accept": {
                        try {
                            const successor = this.handler[parsed.label](Factory.S5, parsed.payload);
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

            register(Role.Peers.C, onReceive);
        }
    };
    export class S2 implements IReceive {
        readonly type: 'Receive' = 'Receive';
        constructor(public handler: Handler.S2) { }

        prepareReceive(next: StateTransitionHandler, cancel: Cancellation, register: ReceiveStateHandler) {
            const onReceive = (message: any) => {
                const parsed = JSON.parse(message) as Message.S2;
                switch (parsed.label) {
                    case "confirm": {
                        try {
                            const successor = this.handler[parsed.label](Factory.S3, parsed.payload);
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

            register(Role.Peers.C, onReceive);
        }
    };



    export class S3 implements ITerminal {
        readonly type: 'Terminal' = 'Terminal';
    };


};

export namespace Factory {


    type S5_confirm =
        | [Message.S5_confirm['payload'], (Next: typeof S3) => State.S3]
        | [Message.S5_confirm['payload'], State.S3]
        ;

    function S5_confirm(
        payload: Message.S5_confirm['payload'],
        generateSuccessor: (Next: typeof S3) => State.S3
    ): State.S5;
    function S5_confirm(
        payload: Message.S5_confirm['payload'],
        succ: State.S3
    ): State.S5;
    function S5_confirm(...args: S5_confirm) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S3);
            return new State.S5(["confirm", payload, successor, Role.Peers.C]);
        } else {
            const [payload, successor] = args;
            return new State.S5(["confirm", payload, successor, Role.Peers.C]);
        }
    }


    export const S5 = {
        confirm: S5_confirm,

    };
    type S1_accept =
        | [Message.S1_accept['payload'], (Next: typeof S2) => State.S2]
        | [Message.S1_accept['payload'], State.S2]
        ;

    function S1_accept(
        payload: Message.S1_accept['payload'],
        generateSuccessor: (Next: typeof S2) => State.S2
    ): State.S1;
    function S1_accept(
        payload: Message.S1_accept['payload'],
        succ: State.S2
    ): State.S1;
    function S1_accept(...args: S1_accept) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S2);
            return new State.S1(["accept", payload, successor, Role.Peers.C]);
        } else {
            const [payload, successor] = args;
            return new State.S1(["accept", payload, successor, Role.Peers.C]);
        }
    }

    type S1_reject =
        | [Message.S1_reject['payload'], (Next: typeof S3) => State.S3]
        | [Message.S1_reject['payload'], State.S3]
        ;

    function S1_reject(
        payload: Message.S1_reject['payload'],
        generateSuccessor: (Next: typeof S3) => State.S3
    ): State.S1;
    function S1_reject(
        payload: Message.S1_reject['payload'],
        succ: State.S3
    ): State.S1;
    function S1_reject(...args: S1_reject) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S3);
            return new State.S1(["reject", payload, successor, Role.Peers.C]);
        } else {
            const [payload, successor] = args;
            return new State.S1(["reject", payload, successor, Role.Peers.C]);
        }
    }

    type S1_counter =
        | [Message.S1_counter['payload'], (Next: typeof S4) => State.S4]
        | [Message.S1_counter['payload'], State.S4]
        ;

    function S1_counter(
        payload: Message.S1_counter['payload'],
        generateSuccessor: (Next: typeof S4) => State.S4
    ): State.S1;
    function S1_counter(
        payload: Message.S1_counter['payload'],
        succ: State.S4
    ): State.S1;
    function S1_counter(...args: S1_counter) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S4);
            return new State.S1(["counter", payload, successor, Role.Peers.C]);
        } else {
            const [payload, successor] = args;
            return new State.S1(["counter", payload, successor, Role.Peers.C]);
        }
    }


    export const S1 = {
        accept: S1_accept,
        reject: S1_reject,
        counter: S1_counter,

    };

    export function S0(handler: Handler.S0) {
        return new State.S0(handler);
    };
    export function S4(handler: Handler.S4) {
        return new State.S4(handler);
    };
    export function S2(handler: Handler.S2) {
        return new State.S2(handler);
    };


    export const Initial = S0;

    export const S3 = () => new State.S3();
    export const Terminal = S3;

};