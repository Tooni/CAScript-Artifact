import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S0, { Payloads } from '../../OnlineWallet/Vendor/S0';
import { MaybePromise } from '../../OnlineWallet/Vendor/Types';

export default class LoginOk extends S0 {

    // todo: put result into context

    login_ok(): MaybePromise<void> {
        console.log('login ok');
    }

    render() {
        return <div>
            <h2>S0: LoginOk</h2>
        </div>
    }
}