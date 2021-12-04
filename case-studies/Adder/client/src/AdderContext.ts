import React from 'react';

export const AdderContext = React.createContext({
    result: -1,
    setResult: (r: number) => {},
});