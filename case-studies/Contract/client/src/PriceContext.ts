import React from 'react';

export const PriceContext = React.createContext({
    price: 0,
    setPrice: (p: number) => {},
    status: "",
    setStatus: (s: string) => {}
});