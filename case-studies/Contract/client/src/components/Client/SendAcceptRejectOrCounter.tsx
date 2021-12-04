import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S4 from '../../Contract/C/S4';
import { PriceContext } from '../../PriceContext';

type ComponentState = {
    counter: number
};

export default class SendAcceptRejectOrCounter extends S4<ComponentState> {
    state = {
        counter: 0
    };

    render() {
        const Accept = this.accept('onClick', ev => {
            return { confirmedPrice: this.context.price }
        });
        const Counter = this.counter('onClick', ev => {
            this.context.setPrice(this.state.counter)
            return { newCounterPrice: this.state.counter }
        });
        const Reject = this.reject('onClick', ev => {
            this.context.setStatus("Rejected!")
            return []
        });

        return <div>
            <h2>S4: SendAcceptRejectOrCounter</h2>
            <Accept><Button>Accept</Button></Accept>
            <br/>
            <TextField 
                id="pay" 
                type="number"
                value={this.state.counter}
                onChange={(ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                    this.setState({ counter: Number(ev.target.value) })}>
            </TextField>
            <Counter><Button>Counter This Counter</Button></Counter>
            <br/>
            <Reject><Button>Reject</Button></Reject>
        </div>
    }
}
SendAcceptRejectOrCounter.contextType = PriceContext;
