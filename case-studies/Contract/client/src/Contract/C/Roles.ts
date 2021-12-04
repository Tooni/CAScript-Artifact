// Roles.ts

export enum Peers {
    P = "P",
};

export type All = Self | Peers;
export type Self = "C";

export type PeersToMapped<Value> = {
    [Role in Peers]: Value
};

// Aliases
export const Self: Self = "C";
export const Server: Peers = Peers.P;