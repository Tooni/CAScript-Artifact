import React from 'react';
import './App.css';
import ClientView from "./components/Client/ClientView";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { AdderContext } from './AdderContext';

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
    const [result, setResult] = React.useState<number>(-1);
    
    return (
        <Provider clearEndpoint={() => setEndpoint(undefined)}>
            <div className="App">
            <AppBar position='sticky'>
                <Toolbar>
                    <Typography variant='h6'>
                        {endpoint === undefined ? 'OnlineWallet Demo'
                        : `Logged in as: Client`}
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

            <AdderContext.Provider value={{
                result,
                setResult,
            }}>
                <AdderContext.Consumer>
                    {({ result }) =>
                        endpoint === Endpoint.Client &&
                            <>
                                {result >= 0 &&
                                    <Typography variant='h5'>
                                        Result: {result}
                                    </Typography>}
                                <ClientView />
                            </>}
                </AdderContext.Consumer>
            </AdderContext.Provider>
            </div>
            </div>
        </Provider>
    );
}

export default App;
