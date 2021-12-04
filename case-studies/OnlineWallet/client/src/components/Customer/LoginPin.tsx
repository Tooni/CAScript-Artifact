import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S1 from '../../OnlineWallet/Customer/S1';
import { StateContext } from '../../StateContext';

type ComponentState = {
    pin: number
};

export default class LoginPin extends S1<ComponentState> {
    state = {
        pin: 1000
    };

    render() {
        const Submit = this.pin('onClick', ev => ({pin: this.state.pin}));

        return <div>
            <h2>S1: PIN</h2>
            <h3>{this.context.loginInfo}</h3>
            <TextField 
                id="pin" 
                type="number"
                InputProps={{ inputProps: { min: 1000, max: 10000 } }}
                value={this.state.pin}
                onChange={(ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                    this.setState({ pin: Number(ev.target.value) })}>
            </TextField>
            <Submit><Button>Submit PIN</Button></Submit>
        </div>
    }
}
LoginPin.contextType = StateContext;