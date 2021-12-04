import React from 'react';

import * as Roles from './Roles';
import {
    State,
    ReceiveState,
    SendState,
    TerminalState,
} from './EFSM';

import {
    MaybePromise,
} from './Types';

import {
    ReceiveHandler
} from './Session';



// ==================
// Message structures
// ==================

enum Labels {
    accept = 'accept',
    reject = 'reject',
    counter = 'counter',
}

export namespace Payloads {
    export interface accept {
        confirmedPrice: number;
    };
    export interface counter {
        counterPrice: number;
    };
}

namespace Messages {
    export interface accept {
        label: Labels.accept;
        payload: Payloads.accept;
    };
    export interface reject {
        label: Labels.reject;

    };
    export interface counter {
        label: Labels.counter;
        payload: Payloads.counter;
    };
}

type Message = Messages.accept | Messages.reject | Messages.counter

// ===============
// Component types
// ===============

type Props = {
    register: (role: Roles.Peers, handle: ReceiveHandler) => void
};

/**
 * __Receives from P.__ Possible messages:
 *
 * * __accept__(Payloads.accept)
 * * __reject__(Payloads.reject)
 * * __counter__(Payloads.counter)
 */
export default abstract class S1<ComponentState = {}> extends React.Component<Props, ComponentState> {

    componentDidMount() {
        this.props.register(Roles.Peers.P, this.handle.bind(this));
    }

    handle(message: any): MaybePromise<State> {
        const parsedMessage = JSON.parse(message) as Message;
        switch (parsedMessage.label) {
            case Labels.accept: {
                const thunk = () => {
                    return SendState.S2;
                }

                const continuation = this.accept(parsedMessage.payload);
                if (continuation instanceof Promise) {
                    return new Promise((resolve, reject) => {
                        continuation.then(() => {
                            resolve(thunk());
                        }).catch(reject);
                    })
                } else {
                    return thunk();
                }
            }
            case Labels.reject: {
                const thunk = () => {
                    return TerminalState.S3;
                }

                const continuation = this.reject();
                if (continuation instanceof Promise) {
                    return new Promise((resolve, reject) => {
                        continuation.then(() => {
                            resolve(thunk());
                        }).catch(reject);
                    })
                } else {
                    return thunk();
                }
            }
            case Labels.counter: {
                const thunk = () => {
                    return SendState.S4;
                }

                const continuation = this.counter(parsedMessage.payload);
                if (continuation instanceof Promise) {
                    return new Promise((resolve, reject) => {
                        continuation.then(() => {
                            resolve(thunk());
                        }).catch(reject);
                    })
                } else {
                    return thunk();
                }
            }

        }
    }

    abstract accept(payload: Payloads.accept): MaybePromise<void>;
    abstract reject(): MaybePromise<void>;
    abstract counter(payload: Payloads.counter): MaybePromise<void>;

}