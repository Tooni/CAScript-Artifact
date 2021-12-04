import React from 'react';
import './App.css';
import CustomerView from "./components/Customer/CustomerView";
import VendorView from './components/Vendor/VendorView';
import { StateContext } from './StateContext';
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";

enum Endpoint { Customer, Vendor };

type Context = {
    clearEndpoint: () => void,
};

export const Context = React.createContext<Context>({
    clearEndpoint: () => {},
});

const Provider: React.FunctionComponent<Context> = props => {
    return (
        <Context.Provider value={{
            clearEndpoint: props.clearEndpoint,
        }}>
            {props.children}
        </Context.Provider>
    );
}

function App() {
    const [endpoint, setEndpoint] = React.useState<Endpoint>();
    const [moneyDue, setMoneyDue] = React.useState<number>(0);
    const [loginInfo, setLoginInfo] = React.useState<string>("");
    
    return (
        <Provider clearEndpoint={() => setEndpoint(undefined)}>
            <div className="App">
            <AppBar position='sticky'>
                <Toolbar>
                    <Typography variant='h6'>
                        {endpoint === undefined ? 'OnlineWallet Demo'
                        : `Logged in as: ${endpoint === Endpoint.Customer ? 'Customer' : 'Vendor'}`}
                    </Typography>
                </Toolbar>
            </AppBar>

            <div style={{ marginTop: '2rem', }}>
            {endpoint === undefined &&
                <div>
                    <Typography variant='h5'>Log in as</Typography>
                    <div>
                        <Button style={{
                            marginLeft: '10px',
                            marginRight: '10px',
                        }}variant='contained' onClick={() => setEndpoint(Endpoint.Customer)}>Customer</Button>
                        <Button style={{
                            marginLeft: '10px',
                            marginRight: '10px',
                        }}variant='contained' onClick={() => setEndpoint(Endpoint.Vendor)}>Vendor</Button>
                    </div>
                </div>}
            
            {endpoint === Endpoint.Customer && 
                <StateContext.Provider 
                    value={{
                        moneyDue,
                        setMoneyDue,
                        loginInfo,
                        setLoginInfo
                    }}> 
                    <StateContext.Consumer>
                    {({ moneyDue, loginInfo }) => <CustomerView />}
                    </StateContext.Consumer>
                </StateContext.Provider>}

            {endpoint === Endpoint.Vendor && 
                <VendorView />}

            </div>
            </div>
        </Provider>
    );
}

export default App;
