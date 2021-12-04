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
    pay = 'pay',
    reject = 'reject',
}

export namespace Payloads {
    export interface pay {
        payment: number;
    };
}

namespace Messages {
    export interface pay {
        label: Labels.pay;
        payload: Payloads.pay;
    };
    export interface reject {
        label: Labels.reject;

    };
}

type Message = Messages.pay | Messages.reject

// ===============
// Component types
// ===============

type Props = {
    register: (role: Roles.Peers, handle: ReceiveHandler) => void
};

/**
 * __Receives from Customer.__ Possible messages:
 *
 * * __pay__(Payloads.pay)
 * * __reject__(Payloads.reject)
 */
export default abstract class S2<ComponentState = {}> extends React.Component<Props, ComponentState> {

    componentDidMount() {
        this.props.register(Roles.Peers.Customer, this.handle.bind(this));
    }

    handle(message: any): MaybePromise<State> {
        const parsedMessage = JSON.parse(message) as Message;
        switch (parsedMessage.label) {
            case Labels.pay: {
                const thunk = () => {
                    return TerminalState.S3;
                }

                const continuation = this.pay(parsedMessage.payload);
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

        }
    }

    abstract pay(payload: Payloads.pay): MaybePromise<void>;
    abstract reject(): MaybePromise<void>;

}