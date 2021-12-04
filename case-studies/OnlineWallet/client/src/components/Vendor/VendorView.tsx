import React from "react";
import { CircularProgress, Typography, Container } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import Vendor from "../../OnlineWallet/Vendor/Vendor";
import LoginOk from "./LoginOk";
import PaymentRequest from "./PaymentRequest";
import PayOrReject from "./PayOrReject";
import Terminal from "./Terminal";

export default class VendorView extends React.Component {
    render() {
        const origin = process.env.REACT_APP_PROXY ?? window.location.origin;
        const endpoint = origin.replace(/^http/, 'ws');
        return (
            <Vendor
                endpoint={endpoint}
                states={{
                    S0: LoginOk,
                    S1: PaymentRequest,
                    S2: PayOrReject,
                    S3: Terminal
                }}
                waiting={
                <div>
                    <CircularProgress />
                    <Typography variant='h6'>No session needs the Vendor yet.</Typography>
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
        );
    }
}