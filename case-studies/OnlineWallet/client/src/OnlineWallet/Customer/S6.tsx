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
    export interface pay {
        payment: number;
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
 * * __Sends to Vendor, pay__(Payloads.pay)
 */
export default abstract class S6<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected pay: SendComponentFactory<Payloads.pay>;

    constructor(props: Props) {
        super(props);
        this.pay = props.factory<Payloads.pay>(
            Roles.Peers.Vendor,
            'pay',
            TerminalState.S3
        );

    }
}