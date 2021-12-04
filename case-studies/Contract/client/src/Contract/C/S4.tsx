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
    export interface counter {
        newCounterPrice: number;
    };
    export interface accept {
        confirmedPrice: number;
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
 * * __Sends to P, counter__(Payloads.counter)
 * * __Sends to P, reject__({})
 * * __Sends to P, accept__(Payloads.accept)
 */
export default abstract class S4<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected counter: SendComponentFactory<Payloads.counter>;
    protected reject: SendComponentFactory<{}>;
    protected accept: SendComponentFactory<Payloads.accept>;

    constructor(props: Props) {
        super(props);
        this.counter = props.factory<Payloads.counter>(
            Roles.Peers.P,
            'counter',
            ReceiveState.S1
        );
        this.reject = props.factory<{}>(
            Roles.Peers.P,
            'reject',
            TerminalState.S3
        );
        this.accept = props.factory<Payloads.accept>(
            Roles.Peers.P,
            'accept',
            ReceiveState.S5
        );

    }
}