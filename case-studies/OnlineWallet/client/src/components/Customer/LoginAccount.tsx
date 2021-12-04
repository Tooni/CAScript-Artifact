import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S0 from '../../OnlineWallet/Customer/S0';
import { StateContext } from '../../StateContext';

type ComponentState = {
    account: number
};

export default class LoginAccount extends S0<ComponentState> {
    state = {
        account: 100001
    };

    render() {
        const Submit = this.login('onClick', ev => ({account: this.state.account}));

        return <div>
            <h2>S0: Account</h2>
            <h3>{this.context.loginInfo}</h3>
            <TextField 
                id="account" 
                type="number"
                value={this.state.account}
                InputProps={{ inputProps: { min: 100000, max: 1000000 } }}
                onChange={(ev) => 
                    this.setState({ account: Number(ev.target.value) })}>
            </TextField>
            <Submit><Button>Submit Account Number</Button></Submit>
        </div>
    }
}
LoginAccount.contextType = StateContext;
