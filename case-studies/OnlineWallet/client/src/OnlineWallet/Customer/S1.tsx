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
    export interface pin {
        pin: number;
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
 * * __Sends to Wallet, pin__(Payloads.pin)
 */
export default abstract class S1<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected pin: SendComponentFactory<Payloads.pin>;

    constructor(props: Props) {
        super(props);
        this.pin = props.factory<Payloads.pin>(
            Roles.Peers.Wallet,
            'pin',
            ReceiveState.S2
        );

    }
}