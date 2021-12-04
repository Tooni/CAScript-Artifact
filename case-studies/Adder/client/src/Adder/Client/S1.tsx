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
    RES = 'RES',
}

export namespace Payloads {
    export interface RES {
        res: number;
    };
}

namespace Messages {
    export interface RES {
        label: Labels.RES;
        payload: Payloads.RES;
    };
}

type Message = Messages.RES

// ===============
// Component types
// ===============

type Props = {
    register: (role: Roles.Peers, handle: ReceiveHandler) => void
};

/**
 * __Receives from Svr.__ Possible messages:
 *
 * * __RES__(Payloads.RES)
 */
export default abstract class S1<ComponentState = {}> extends React.Component<Props, ComponentState> {

    componentDidMount() {
        this.props.register(Roles.Peers.Svr, this.handle.bind(this));
    }

    handle(message: any): MaybePromise<State> {
        const parsedMessage = JSON.parse(message) as Message;
        switch (parsedMessage.label) {
            case Labels.RES: {
                const thunk = () => {
                    return SendState.S0;
                }

                const continuation = this.RES(parsedMessage.payload);
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

    abstract RES(payload: Payloads.RES): MaybePromise<void>;

}