import React from "react";
import { CircularProgress, Typography, Container } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Client } from "../../Adder/Client";
import SendAddOrQuit from "./SendAddOrQuit";
import Terminal from "./Terminal";
import RecvRes from "./RecvRes";

export default class ClientView extends React.Component {
    render() {
        const origin = process.env.REACT_APP_PROXY ?? window.location.origin;
        const endpoint = origin.replace(/^http/, 'ws');
        return <Client
                endpoint={endpoint}
                states={{
                    S0: SendAddOrQuit,
                    S1: RecvRes,
                    S2: Terminal
                }}
                waiting={
                <div>
                    <CircularProgress />
                    <Typography variant='h6'>Shouldn't show this!</Typography>
                </div>
                }
                connectFailed={
                <Container>
                    <Alert severity='error'>Cannot Connect</Alert>   
                </Container>
                }
                cancellation={(role, reason) => {
                    return (  
                    <Container>
                        <Alert severity='error'>{role} cancelled session: {reason}</Alert>
                    </Container>
                    );
                }}
            />;
    }
}