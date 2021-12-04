import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S4, { Payloads } from '../../OnlineWallet/Customer/S4';
import { MaybePromise } from '../../OnlineWallet/Customer/Types';
import { StateContext } from "../../StateContext";

export default class PaymentRequest extends S4 {
    request(payload: Payloads.request): MaybePromise<void> {
        this.context.setMoneyDue(payload.bill);
    }

    render() {
        return <div>
            <h2>S4: PaymentRequest</h2>
        </div>
    }
}
PaymentRequest.contextType = StateContext;