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
    export interface propose {
        initialPrice: number;
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
 * * __Sends to P, propose__(Payloads.propose)
 */
export default abstract class S0<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected propose: SendComponentFactory<Payloads.propose>;

    constructor(props: Props) {
        super(props);
        this.propose = props.factory<Payloads.propose>(
            Roles.Peers.P,
            'propose',
            ReceiveState.S1
        );

    }
}