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
    export interface request {
        bill: number;
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
 * * __Sends to Customer, request__(Payloads.request)
 */
export default abstract class S1<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected request: SendComponentFactory<Payloads.request>;

    constructor(props: Props) {
        super(props);
        this.request = props.factory<Payloads.request>(
            Roles.Peers.Customer,
            'request',
            ReceiveState.S2
        );

    }
}