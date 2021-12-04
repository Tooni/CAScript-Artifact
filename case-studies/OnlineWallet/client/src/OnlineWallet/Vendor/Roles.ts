// Roles.ts

export enum Peers {
    Wallet = "Wallet", Customer = "Customer",
};

export type All = Self | Peers;
export type Self = "Vendor";

export type PeersToMapped<Value> = {
    [Role in Peers]: Value
};

// Aliases
export const Self: Self = "Vendor";
export const Server: Peers = Peers.Wallet;