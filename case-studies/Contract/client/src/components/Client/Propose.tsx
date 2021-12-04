import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S0 from '../../Contract/C/S0';
import { PriceContext } from '../../PriceContext';

type ComponentState = {
    initialPrice: number
};

export default class Propose extends S0<ComponentState> {
    state = {
        initialPrice: 0
    };

    render() {
        const Propose = this.propose('onClick', ev => {
            this.context.setPrice(this.state.initialPrice)
            return this.state
        });

        return <div>
            <h2>S0: Propose</h2>
            <TextField 
                id="initialPrice" 
                type="number"
                value={this.state.initialPrice}
                onChange={(ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                    this.setState({ initialPrice: Number(ev.target.value) })
                }>
            </TextField>
            <Propose><Button>Propose a price</Button></Propose>
        </div>
    }
}
Propose.contextType = PriceContext;