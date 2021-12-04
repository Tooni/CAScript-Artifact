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
    type Self = "Wallet";

    // Constant value for value comparisons
    export const Self: Self = "Wallet";

    export enum Peers {
        Vendor = "Vendor", Customer = "Customer",
    };

    export type All = Self | Peers;

    export type PeersToMapped<Value> = {
        [Role in Peers]: Value
    };
};

export namespace Message {

    export interface S4_login_ok_payload {
    }
    export interface S4_login_ok {
        label: "login_ok",
        payload: S4_login_ok_payload
    };

    export type S4 = | S4_login_ok;

    export interface S2_login_retry_payload {
        msg: string,
    }
    export interface S2_login_retry {
        label: "login_retry",
        payload: S2_login_retry_payload
    };
    export interface S2_login_denied_payload {
        msg: string,
    }
    export interface S2_login_denied {
        label: "login_denied",
        payload: S2_login_denied_payload
    };
    export interface S2_login_ok_payload {
    }
    export interface S2_login_ok {
        label: "login_ok",
        payload: S2_login_ok_payload
    };

    export type S2 = | S2_login_retry | S2_login_denied | S2_login_ok;

    export interface S0_login_payload {
        account: number,
    }
    export interface S0_login {
        label: "login",
        payload: S0_login_payload
    };

    export type S0 = | S0_login;

    export interface S5_authorise_payload {
    }
    export interface S5_authorise {
        label: "authorise",
        payload: S5_authorise_payload
    };
    export interface S5_reject_payload {
    }
    export interface S5_reject {
        label: "reject",
        payload: S5_reject_payload
    };

    export type S5 = | S5_authorise | S5_reject;

    export interface S1_pin_payload {
        pin: number,
    }
    export interface S1_pin {
        label: "pin",
        payload: S1_pin_payload
    };

    export type S1 = | S1_pin;


    export interface Channel {
        role: Role.All;
        label: string;
        payload: any;
    };

    export const serialise = <T>(obj: T) => JSON.stringify(obj);
    export const deserialise = <T>(message: any) => JSON.parse(message) as T;

};

export namespace Handler {
    export type S4 =
        MaybePromise<
            | ["login_ok", Message.S4_login_ok['payload'], State.S5, Role.Peers.Vendor]

        >;
    export type S2 =
        MaybePromise<
            | ["login_retry", Message.S2_login_retry['payload'], State.S0, Role.Peers.Customer]
            | ["login_denied", Message.S2_login_denied['payload'], State.S3, Role.Peers.Customer]
            | ["login_ok", Message.S2_login_ok['payload'], State.S4, Role.Peers.Customer]

        >;

    export interface S0 {
        "login": (Next: typeof Factory.S1, payload: Message.S0_login['payload']) => MaybePromise<State.S1>,

    };
    export interface S5 {
        "authorise": (Next: typeof Factory.S3, payload: Message.S5_authorise['payload']) => MaybePromise<State.S3>,
        "reject": (Next: typeof Factory.S3, payload: Message.S5_reject['payload']) => MaybePromise<State.S3>,

    };
    export interface S1 {
        "pin": (Next: typeof Factory.S2, payload: Message.S1_pin['payload']) => MaybePromise<State.S2>,

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

    export class S4 implements ISend {
        readonly type: 'Send' = 'Send';
        constructor(public handler: Handler.S4) { }

        performSend(next: StateTransitionHandler, cancel: Cancellation, send: SendStateHandler) {
            const thunk = ([label, payload, successor, role]: FromPromise<Handler.S4>) => {
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
    export class S2 implements ISend {
        readonly type: 'Send' = 'Send';
        constructor(public handler: Handler.S2) { }

        performSend(next: StateTransitionHandler, cancel: Cancellation, send: SendStateHandler) {
            const thunk = ([label, payload, successor, role]: FromPromise<Handler.S2>) => {
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
                    case "login": {
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

            register(Role.Peers.Customer, onReceive);
        }
    };
    export class S5 implements IReceive {
        readonly type: 'Receive' = 'Receive';
        constructor(public handler: Handler.S5) { }

        prepareReceive(next: StateTransitionHandler, cancel: Cancellation, register: ReceiveStateHandler) {
            const onReceive = (message: any) => {
                const parsed = JSON.parse(message) as Message.S5;
                switch (parsed.label) {
                    case "authorise": {
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

                }
            };

            register(Role.Peers.Customer, onReceive);
        }
    };
    export class S1 implements IReceive {
        readonly type: 'Receive' = 'Receive';
        constructor(public handler: Handler.S1) { }

        prepareReceive(next: StateTransitionHandler, cancel: Cancellation, register: ReceiveStateHandler) {
            const onReceive = (message: any) => {
                const parsed = JSON.parse(message) as Message.S1;
                switch (parsed.label) {
                    case "pin": {
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

            register(Role.Peers.Customer, onReceive);
        }
    };



    export class S3 implements ITerminal {
        readonly type: 'Terminal' = 'Terminal';
    };


};

export namespace Factory {


    type S4_login_ok =
        | [Message.S4_login_ok['payload'], (Next: typeof S5) => State.S5]
        | [Message.S4_login_ok['payload'], State.S5]
        ;

    function S4_login_ok(
        payload: Message.S4_login_ok['payload'],
        generateSuccessor: (Next: typeof S5) => State.S5
    ): State.S4;
    function S4_login_ok(
        payload: Message.S4_login_ok['payload'],
        succ: State.S5
    ): State.S4;
    function S4_login_ok(...args: S4_login_ok) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S5);
            return new State.S4(["login_ok", payload, successor, Role.Peers.Vendor]);
        } else {
            const [payload, successor] = args;
            return new State.S4(["login_ok", payload, successor, Role.Peers.Vendor]);
        }
    }


    export const S4 = {
        login_ok: S4_login_ok,

    };
    type S2_login_retry =
        | [Message.S2_login_retry['payload'], (Next: typeof S0) => State.S0]
        | [Message.S2_login_retry['payload'], State.S0]
        ;

    function S2_login_retry(
        payload: Message.S2_login_retry['payload'],
        generateSuccessor: (Next: typeof S0) => State.S0
    ): State.S2;
    function S2_login_retry(
        payload: Message.S2_login_retry['payload'],
        succ: State.S0
    ): State.S2;
    function S2_login_retry(...args: S2_login_retry) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S0);
            return new State.S2(["login_retry", payload, successor, Role.Peers.Customer]);
        } else {
            const [payload, successor] = args;
            return new State.S2(["login_retry", payload, successor, Role.Peers.Customer]);
        }
    }

    type S2_login_denied =
        | [Message.S2_login_denied['payload'], (Next: typeof S3) => State.S3]
        | [Message.S2_login_denied['payload'], State.S3]
        ;

    function S2_login_denied(
        payload: Message.S2_login_denied['payload'],
        generateSuccessor: (Next: typeof S3) => State.S3
    ): State.S2;
    function S2_login_denied(
        payload: Message.S2_login_denied['payload'],
        succ: State.S3
    ): State.S2;
    function S2_login_denied(...args: S2_login_denied) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S3);
            return new State.S2(["login_denied", payload, successor, Role.Peers.Customer]);
        } else {
            const [payload, successor] = args;
            return new State.S2(["login_denied", payload, successor, Role.Peers.Customer]);
        }
    }

    type S2_login_ok =
        | [Message.S2_login_ok['payload'], (Next: typeof S4) => State.S4]
        | [Message.S2_login_ok['payload'], State.S4]
        ;

    function S2_login_ok(
        payload: Message.S2_login_ok['payload'],
        generateSuccessor: (Next: typeof S4) => State.S4
    ): State.S2;
    function S2_login_ok(
        payload: Message.S2_login_ok['payload'],
        succ: State.S4
    ): State.S2;
    function S2_login_ok(...args: S2_login_ok) {
        if (typeof args[1] === 'function') {
            const [payload, generateSuccessor] = args;
            const successor = generateSuccessor(S4);
            return new State.S2(["login_ok", payload, successor, Role.Peers.Customer]);
        } else {
            const [payload, successor] = args;
            return new State.S2(["login_ok", payload, successor, Role.Peers.Customer]);
        }
    }


    export const S2 = {
        login_retry: S2_login_retry,
        login_denied: S2_login_denied,
        login_ok: S2_login_ok,

    };

    export function S0(handler: Handler.S0) {
        return new State.S0(handler);
    };
    export function S5(handler: Handler.S5) {
        return new State.S5(handler);
    };
    export function S1(handler: Handler.S1) {
        return new State.S1(handler);
    };


    export const Initial = S0;

    export const S3 = () => new State.S3();
    export const Terminal = S3;

};