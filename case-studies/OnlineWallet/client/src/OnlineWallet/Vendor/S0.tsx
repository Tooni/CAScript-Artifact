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
    login_ok = 'login_ok',
}

export namespace Payloads {
}

namespace Messages {
    export interface login_ok {
        label: Labels.login_ok;

    };
}

type Message = Messages.login_ok

// ===============
// Component types
// ===============

type Props = {
    register: (role: Roles.Peers, handle: ReceiveHandler) => void
};

/**
 * __Receives from Wallet.__ Possible messages:
 *
 * * __login_ok__(Payloads.login_ok)
 */
export default abstract class S0<ComponentState = {}> extends React.Component<Props, ComponentState> {

    componentDidMount() {
        this.props.register(Roles.Peers.Wallet, this.handle.bind(this));
    }

    handle(message: any): MaybePromise<State> {
        const parsedMessage = JSON.parse(message) as Message;
        switch (parsedMessage.label) {
            case Labels.login_ok: {
                const thunk = () => {
                    return SendState.S1;
                }

                const continuation = this.login_ok();
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

    abstract login_ok(): MaybePromise<void>;

}