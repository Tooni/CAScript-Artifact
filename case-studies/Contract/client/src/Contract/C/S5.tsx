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
    confirm = 'confirm',
}

export namespace Payloads {
}

namespace Messages {
    export interface confirm {
        label: Labels.confirm;

    };
}

type Message = Messages.confirm

// ===============
// Component types
// ===============

type Props = {
    register: (role: Roles.Peers, handle: ReceiveHandler) => void
};

/**
 * __Receives from P.__ Possible messages:
 *
 * * __confirm__(Payloads.confirm)
 */
export default abstract class S5<ComponentState = {}> extends React.Component<Props, ComponentState> {

    componentDidMount() {
        this.props.register(Roles.Peers.P, this.handle.bind(this));
    }

    handle(message: any): MaybePromise<State> {
        const parsedMessage = JSON.parse(message) as Message;
        switch (parsedMessage.label) {
            case Labels.confirm: {
                const thunk = () => {
                    return TerminalState.S3;
                }

                const continuation = this.confirm();
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

    abstract confirm(): MaybePromise<void>;

}