import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S1 from '../../OnlineWallet/Vendor/S1';

type ComponentState = {
    request: number
};

export default class PaymentRequest extends S1<ComponentState> {
    state = {
        request: 1
    };

    render() {
        const Request = this.request('onClick', ev => ({bill: this.state.request}));

        return <div>
            <h2>S1: Reject</h2>
            <TextField 
                id="request" 
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={this.state.request}
                onChange={(ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                    this.setState({ request: Number(ev.target.value) })}>
            </TextField>
            <Request><Button>Request</Button></Request>
        </div>
    }
}