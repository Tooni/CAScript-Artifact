import express from 'express';
import path from 'path';
import http from 'http';
import WebSocket from 'ws';
import { Session, Wallet } from './OnlineWallet/Wallet';
import DB from "./SessionManager";

const app = express();

// Serve client-side static files.
app.use(express.static(path.join(__dirname, 'client')));

// Create WebSocket server.
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const onlineWalletServerLogic = (sessionID: string) => {
    DB.initSession(sessionID);
    const handleRequest = Session.Initial({
        login: (Next, accountPayload) => 
            Next({
                pin: (Next, pinPayload) => {
                    if (accountPayload.account === 100000 && pinPayload.pin === 1000) {
                        console.log('Login details correct!');
                        return Next.login_ok({}, (Next) => {
                            return Next.login_ok({}, (Next) => {
                                DB.deleteSession(sessionID);
                                return Next({
                                    authorise: Session.Terminal,
                                    reject: Session.Terminal
                                });
                            });
                        })
                    }
                    const numTries = DB.getNumTries(sessionID);
                    if (numTries < 3) {
                        DB.makeTry(sessionID);
                        const msg = `Login details incorrect!  ${3 - numTries} attempts left.`;
                        console.log(msg);
                        return Next.login_retry({ msg }, handleRequest);
                    }
                    const msg = 'Login details incorrect!  You are out of attempts.';
                    console.log(msg);
                    return Next.login_denied({ msg }, Session.Terminal);
                }
            })
    });
    return handleRequest;
};

// ============
// Execute EFSM
// ============

new Wallet(
    wss,
    (sessionID, role, reason) => {
        // Simple cancellation handler
        console.error(`${sessionID}: ${role} cancelled session because: ${reason}`);
        DB.deleteSession(sessionID);
    },
    onlineWalletServerLogic
);

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
