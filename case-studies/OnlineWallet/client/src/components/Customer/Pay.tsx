import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S6 from '../../OnlineWallet/Customer/S6';
import { StateContext } from "../../StateContext";

export default class Pay extends S6 {

    render() {
        const Pay = this.pay('onClick', ev => ({payment: this.context.moneyDue}));

        return <div>
            <h2>S6: Pay</h2>
            <h2>Make payment of &#163;{this.context.moneyDue}</h2>
            <Pay><Button variant="contained">Pay</Button></Pay>
        </div>
    }
}
Pay.contextType = StateContext;