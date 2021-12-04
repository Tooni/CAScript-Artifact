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
    export interface login {
        account: number;
    };
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
 * * __Sends to Wallet, login__(Payloads.login)
 */
export default abstract class S0<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected login: SendComponentFactory<Payloads.login>;

    constructor(props: Props) {
        super(props);
        this.login = props.factory<Payloads.login>(
            Roles.Peers.Wallet,
            'login',
            SendState.S1
        );

    }
}