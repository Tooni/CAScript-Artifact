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
    export interface ADD {
        x: number;
        y: number;
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
 * * __Sends to Svr, ADD__(Payloads.ADD)
 * * __Sends to Svr, QUIT__({})
 */
export default abstract class S0<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected ADD: SendComponentFactory<Payloads.ADD>;
    protected QUIT: SendComponentFactory<{}>;

    constructor(props: Props) {
        super(props);
        this.ADD = props.factory<Payloads.ADD>(
            Roles.Peers.Svr,
            'ADD',
            ReceiveState.S1
        );
        this.QUIT = props.factory<{}>(
            Roles.Peers.Svr,
            'QUIT',
            TerminalState.S2
        );

    }
}