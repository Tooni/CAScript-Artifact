// Roles.ts

export enum Peers {
    Vendor = "Vendor", Wallet = "Wallet",
};

export type All = Self | Peers;
export type Self = "Customer";

export type PeersToMapped<Value> = {
    [Role in Peers]: Value
};

// Aliases
export const Self: Self = "Customer";
export const Server: Peers = Peers.Wallet;