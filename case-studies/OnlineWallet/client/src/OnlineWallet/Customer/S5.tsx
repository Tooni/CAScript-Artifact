import React from 'react';

import * as Roles from './Roles';

import {
    ReceiveState,
    SendState,
    TerminalState
} from './EFSM';

import {
    SendComponentFactory,
    SendComponentFactoryFactory
} from './Session';



// ==================
// Message structures
// ==================

namespace Payloads {
}

// ===============
// Component types
// ===============

type Props = {
    factory: SendComponentFactoryFactory
}

/**
 * __Send state: Possible messages:
 *
 * * __Sends to Wallet, authorise__({})
 * * __Sends to Wallet, reject__({})
 */
export default abstract class S5<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected authorise: SendComponentFactory<{}>;
    protected reject: SendComponentFactory<{}>;

    constructor(props: Props) {
        super(props);
        this.authorise = props.factory<{}>(
            Roles.Peers.Wallet,
            'authorise',
            SendState.S6
        );
        this.reject = props.factory<{}>(
            Roles.Peers.Wallet,
            'reject',
            SendState.S7
        );

    }
}