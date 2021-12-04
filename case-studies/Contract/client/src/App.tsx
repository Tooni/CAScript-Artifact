import React from 'react';
import './App.css';
import ClientView from "./components/Client/ClientView";

import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { PriceContext } from './PriceContext';

enum Endpoint { Client };

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
    const [price, setPrice] = React.useState<number>(0);
    const [status, setStatus] = React.useState<string>("Bartering begins!");
    
    return (
        <Provider clearEndpoint={() => setEndpoint(undefined)}>
            <div className="App">
            <AppBar position='sticky'>
                <Toolbar>
                    <Typography variant='h6'>
                        {endpoint === undefined ? 'Contract'
                        : `Logged in as: ${endpoint === Endpoint.Client ? 'Client' : 'nada'}`}
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
                        }}variant='contained' onClick={() => setEndpoint(Endpoint.Client)}>Client</Button>
                    </div>
                </div>}
            
                <PriceContext.Provider value={{
                    price,
                    setPrice,
                    status,
                    setStatus
                }}>
                    <PriceContext.Consumer>
                        {({ price, status }) =>
                            endpoint === Endpoint.Client &&
                                <>
                                    <Typography variant='h5'>
                                        {status}
                                        {price <= 0 ? '' : ` £${price}`}
                                    </Typography>
                                    <ClientView />
                                </>}
                    </PriceContext.Consumer>
                </PriceContext.Provider>
            </div>
            </div>
        </Provider>
    );
}

export default App;
