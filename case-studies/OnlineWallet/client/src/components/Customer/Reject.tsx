import React from 'react';
import { Button } from '@material-ui/core';
import S7 from '../../OnlineWallet/Customer/S7';

export default class Reject extends S7 {

    render() {
        const Reject = this.reject('onClick', ev => ({}));

        return <div>
            <h2>S7: Reject</h2>
            <Reject><Button>Reject</Button></Reject>
        </div>
    }
}