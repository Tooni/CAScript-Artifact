import React from 'react';
import { TextField, Button } from '@material-ui/core';
import S0 from '../../Adder/Client/S0';

type ComponentState = {
    x: number,
    y: number
};

export default class SendAddOrQuit extends S0<ComponentState> {
    state = {
        x: 0,
        y: 0
    };

    render() {
        const Submit = this.ADD('onClick', ev => (this.state));

        return <div>
            <h2>S0: SendAddOrQuit</h2>
            <h3>{this.context.loginInfo}</h3>
            <TextField 
                id="x" 
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={this.state.x}
                onChange={(ev) => 
                    this.setState({ x: Number(ev.target.value) })}>
            </TextField>
            <br />
            <TextField 
                id="y" 
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={this.state.y}
                onChange={(ev) => 
                    this.setState({ y: Number(ev.target.value) })}>
            </TextField>
            <br />
            <Submit><Button>Submit</Button></Submit>
        </div>
    }
}
