import React from 'react';
import S5 from '../../Contract/C/S5';
import { MaybePromise } from '../../Contract/C/Types';
import { PriceContext } from '../../PriceContext';

type ComponentState = {
    info: string
};

export default class RecvConfirm extends S5<ComponentState> {
    state = {
        info: ""
    };

    confirm(): MaybePromise<void> {
        this.setState({ info: "Confirmed!" })
        this.context.setStatus("Confirmed!")
    }

    render() {
        return <div>
            <h2>S5: RecvConfirm</h2>
            <h1>{this.state.info}</h1>
        </div>
    }
}
RecvConfirm.contextType = PriceContext;
