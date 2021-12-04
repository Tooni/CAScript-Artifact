import React from 'react';

export const StateContext = React.createContext({
    moneyDue: 0,
    setMoneyDue: (bill: number) => {},
    loginInfo: "",
    setLoginInfo: (newInfo: string) => {}
});