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
    request = 'request',
}

export namespace Payloads {
    export interface request {
        bill: number;
    };
}

namespace Messages {
    export interface request {
        label: Labels.request;
        payload: Payloads.request;
    };
}

type Message = Messages.request

// ===============
// Component types
// ===============

type Props = {
    register: (role: Roles.Peers, handle: ReceiveHandler) => void
};

/**
 * __Receives from Vendor.__ Possible messages:
 *
 * * __request__(Payloads.request)
 */
export default abstract class S4<ComponentState = {}> extends React.Component<Props, ComponentState> {

    componentDidMount() {
        this.props.register(Roles.Peers.Vendor, this.handle.bind(this));
    }

    handle(message: any): MaybePromise<State> {
        const parsedMessage = JSON.parse(message) as Message;
        switch (parsedMessage.label) {
            case Labels.request: {
                const thunk = () => {
                    return SendState.S5;
                }

                const continuation = this.request(parsedMessage.payload);
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

    abstract request(payload: Payloads.request): MaybePromise<void>;

}