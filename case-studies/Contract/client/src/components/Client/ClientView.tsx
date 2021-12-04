import React from "react";
import { CircularProgress, Typography, Container } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import C from "../../Contract/C/C";
import Propose from "./Propose";
import RecvAcceptRejectOrCounter from "./RecvAcceptRejectOrCounter";
import SendConfirm from "./SendConfirm";
import RecvConfirm from "./RecvConfirm";
import Terminal from "./Terminal";
import SendAcceptRejectOrCounter from "./SendAcceptRejectOrCounter";

export default class ClientView extends React.Component {
    render() {
        const origin = process.env.REACT_APP_PROXY ?? window.location.origin;
        const endpoint = origin.replace(/^http/, 'ws');
        return (
            <>
                <C
                    endpoint={endpoint}
                    states={{
                    S0: Propose,
                    S1: RecvAcceptRejectOrCounter,
                    S2: SendConfirm,
                    S3: Terminal,
                    S4: SendAcceptRejectOrCounter,
                    S5: RecvConfirm
                    }}
                    waiting={
                    <div>
                        <CircularProgress />
                        <Typography variant='h6'>Waiting...</Typography>
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
                />
            </>
        );
    }
}