import React from 'react';
import { Button } from '@material-ui/core';
import S2 from '../../Contract/C/S2';
import { PriceContext } from '../../PriceContext';

export default class Confirm extends S2 {
    render() {
        
        const Confirm = this.confirm('onClick', ev => {
            this.context.setStatus("Confirmed!")
            return []
        });

        return <div>
            <h2>S2: SendConfirm</h2>
            <Confirm><Button>Confirm</Button></Confirm>
        </div>
    }
}
Confirm.contextType = PriceContext;

