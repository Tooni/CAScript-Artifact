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
 * * __Sends to Vendor, reject__({})
 */
export default abstract class S7<ComponentState = {}> extends React.Component<Props, ComponentState> {
    protected reject: SendComponentFactory<{}>;

    constructor(props: Props) {
        super(props);
        this.reject = props.factory<{}>(
            Roles.Peers.Vendor,
            'reject',
            TerminalState.S3
        );

    }
}