// =============
// Set up server
// =============

import express from "express";
import path from "path";
import http from "http";
import WebSocket from "ws";

const app = express();

// Serve client-side static files.
app.use(express.static(path.join(__dirname, "client")));

// Create WebSocket server.
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ==================
// Implement protocol
// ==================

import {
    Session,  // Holds named constructors for main EFSM states.
    P,        // Constructor for session runtime.
} from "./Contract/P";
import { Handler, State, Factory, Message } from './Contract/P/EFSM';

const adderServerLogic = (sessionID: string) => {
    let rec = async (Next: typeof Factory.S1, payload: Message.S4_counter_payload) => {
        if (payload.newCounterPrice >= 9) {
            console.log("Accepted!")
            return Next.accept({confirmedPrice: payload.newCounterPrice}, Next => Next({
                confirm: Session.Terminal
            }));
        } else if (payload.newCounterPrice < 10 && payload.newCounterPrice > 0) {
            console.log("Rejected counter price! Offering new counter of £10!")
            return Next.counter({counterPrice: 10}, Next => Next({
                accept: async (Next, _) => {
                    console.log("Accepted!")
                    return Next.confirm([], Session.Terminal);
                },
                counter: rec,
                reject: Session.Terminal
            }))
        } else {
            console.log("Outright rejected!")
            return Next.reject([], Session.Terminal)
        }
    };

    const handleRequest = Session.Initial({
        propose: async (Next: typeof Factory.S1, payload: Message.S0_propose_payload) => {
            if (payload.initialPrice === 10) {
                console.log("Accepted!")
                return Next.accept({confirmedPrice: 10}, Next => Next({
                    confirm: Session.Terminal
                }));
            } else if (payload.initialPrice < 10 && payload.initialPrice > 0) {
                console.log("Rejected! Offering counter of £10!")
                return Next.counter({counterPrice: 10}, Next => Next({
                    accept: async (Next, _) => {
                        console.log("Accepted!")
                        return Next.confirm([], Session.Terminal);
                    },
                    counter: rec,
                    reject: Session.Terminal
                }))
            } else {
                console.log("Outright rejected!")
                return Next.reject([], Session.Terminal)
            }
        }
    });

    return handleRequest;
};

// ============
// Execute EFSM
// ============

new P(
    wss,
    (sessionID, role, reason) => {
        // Simple cancellation handler
        console.error(`${sessionID}: ${role} cancelled session because of ${reason}`);
    },
    adderServerLogic,
);

const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});