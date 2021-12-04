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
 * * __Sends to P, confirm__({})
 */
export default abstract class S2<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected confirm: SendComponentFactory<{}>;

    constructor(props: Props) {
        super(props);
        this.confirm = props.factory<{}>(
            Roles.Peers.P,
            'confirm',
            TerminalState.S3
        );

    }
}