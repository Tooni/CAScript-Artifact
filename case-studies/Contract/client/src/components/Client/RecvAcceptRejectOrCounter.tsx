import React from 'react';
import S1, { Payloads } from '../../Contract/C/S1';
import { MaybePromise } from '../../Contract/C/Types';
import { PriceContext } from '../../PriceContext';

type ComponentState = {
    price: number
};

export default class RecvAcceptRejectOrCounter extends S1<ComponentState> {

    accept(payload: Payloads.accept): MaybePromise<void> {
        this.setState({ price: payload.confirmedPrice });
        this.context.setPrice(this.state.price)
        this.context.setStatus("Accepted:")
    }

    state = {
        price: 0
    };

    reject(): MaybePromise<void> {
        this.setState({ price: -1 });
        this.context.setPrice(this.state.price)
        this.context.setStatus("Rejected!")
    }

    counter(payload: Payloads.counter): MaybePromise<void> {
        this.setState({ price: payload.counterPrice });
        this.context.setPrice(this.state.price)
        this.context.setStatus("Counter offer:")
    }

    render() {
        return <div>
            <h2>S1: RecvAcceptRejectOrCounter</h2>
            <h1>{this.state.price}</h1>
        </div>
    }
}
RecvAcceptRejectOrCounter.contextType = PriceContext;
