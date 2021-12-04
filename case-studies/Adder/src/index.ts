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
    Svr,      // Constructor for session runtime.
} from "./Adder/Svr";
import { Factory, Message } from './Adder/Svr/EFSM';

const adderServerLogic = (sessionID: string) => {
    const handleRequest = Session.Initial({
        ADD: (Next: typeof Factory.S1, payload: Message.S0_ADD_payload) => {
            const { x, y } = payload;
            console.log(`Received request: ${x} + ${y}`)
            console.log(`Sending result: ${x + y}`)
            return Next.RES({ res: x + y }, handleRequest)
        },
        QUIT: Session.Terminal
    });

    return handleRequest;
};

// ============
// Execute EFSM
// ============

new Svr(
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