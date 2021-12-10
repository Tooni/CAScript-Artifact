This Readme is based heavily on [this wiki page](https://github.com/ansonmiu0214/TypeScript-Multiparty-Sessions/wiki/Guide-to-Implementing-Your-Own-Protocols) 
from Anson Miu's project STScript.

# Running the artifact

```bash
$ gunzip cascript-artifact_dev_latest.tar.gz
$ docker load < cascript-artifact_dev_latest.tar
$ docker run -it -p 127.0.0.1:5000:5000 -p 127.0.0.1:8080:8080 -p 127.0.0.1:8888:8888 cascript-artifact_dev
```
Some of these commands may require `sudo`. They also assume `dockerd` is running.

# Building and running case-studies
The artifact comes with three case-studies implemented using CAScript -- OnlineWallet, Adder, 
and Contract -- each corresponding to a Scribble protocol from the `protocols` folder.

For each, you can run a build script from `~`. E.g.
```bash
$ build_onlinewallet
```
This will:
1. Generate the TypeScript files, using CAScript, by reading from the `protocols` folder.
2. Install Node dependencies for the applications, for both the browsers and web server.
3. Compile the application.

These scripts are in the `scripts` folder.

Once you have run a case-study's build script, you can instantiate the server for it. 
For OnlineWallet, for example, you would do:
```bash
$ cd ~/case-studies/OnlineWallet
$ npm start
```
Then, the single-page application would be accessible at [https://localhost:8080/](https://localhost:8080/).

## Playing with the case studies
### OnlineWallet
This case-study involve three roles: the Customer, Vendor and Wallet. The web server
(that you reach via localhost) represents the server, and two browsers using the 
website represent the other roles. So, to use this case-study alone, you need two browser tabs. 

Firstly, you must join the session as the Customer, by clicking the respective button.
At this point you are presented with a login screen, where you submit an account number and PIN.
The correct numbers to get through this stage are **100000** and **1000** respectively.
If you fail the login too many times, the session will terminate (without having involved the Vendor)
and you'll have to refresh the page to try again. 

Once you have successfully logged in with the Customer, you can click the Vendor button on your
second tab, to join the session as the Vendor. From this point onward, you can intuitively follow
the buttons and text on the screen to try different paths through the protocol. 

### Contract

This protocol represents a Customer (`C`) bartering with a Pawnbroker (`P`). Please note the behaviour 
of both parties here is very irrational. You need only one browser tab for this case study, and that 
tab will take on the role of the Customer. You start by proposing a price for the item you are pawning.
If you propose exactly £10, your proposal will be accepted and the session will end. If you proposed 
a negative amount of money, the Pawnbroker will be offended and the session will end. Otherwise, the 
Pawnbroker will provide a counter offer of £10. At this point, the session loops, but the Pawnbroker
will now accept any amount of money greater than or equal to £9.

### Adder

This protocol represents a Client sending sums to a Server. Again, you need only one browser tab, which
will be the Client. You send two numbers to the server, and the server sends back their sum.

# Implementing your own protocols

The rest of this document walks through how to generate TypeScript APIs for a simple Adder web-service. 
The artifact already comes with an implementation of Adder. This document's one is slightly simpler.

In the Adder web-service, clients either:

1. Submit two integers to the server, and receive the sum; or
2. Request to exit the service.

The Adder protocol can be located under
`~/protocols/Adder.scr`.

You can use the other web applications
under `~/case-studies` as a template,
but this guide will walk through the steps
from scratch.

__Note:__ This guide will require you to write new source code files
using a terminal editor. The Docker image comes with `vim` and `nano`
installed. If you wish to install additional software for editing, obtain
sudo access with the password `dev`.

__Note:__ Throughout, the path `~` should be equivalent to `/home/dev`.

## 1️⃣ Initialise web application

We will create the Adder web-service under
the `~/case-studies` directory.
This will hold both the server and client roles.

### Initialise server

Run the following commands to initialise the Adder server as a Node application
using TypeScript.

```bash
$ mkdir -p ~/case-studies/SimplerAdder
$ cd ~/case-studies/SimplerAdder
```

Run the following commands to copy the `package.json` and `tsconfig.json` files from the OnlineWallet application,
as the dependencies will be the same.

> We need the build scripts and dependencies from `package.json`,
> and the TypeScript project configurations from `tsconfig.json`.

_Optional:_
You may also change the `name` and `description` fields of the
`package.json` file to refer to the SimplerAdder web-service instead.

```bash
$ cd ~/case-studies/SimplerAdder
$ cp ../OnlineWallet/package.json ../OnlineWallet/tsconfig.json ./
```

Run the following commands to set up the Node project.

```bash
$ cd ~/case-studies/SimplerAdder

# Source code for server will go inside 'src'
$ mkdir src

# Install dependencies
$ npm i
```

### Initialise client

Run the following commands to initialise the SimplerAdder client as a React application using TypeScript.

```bash
$ cd ~/case-studies/SimplerAdder

# Create React application with TypeScript project setup.
# This will take a couple of minutes...
$ npx create-react-app client --template typescript

# Install dependencies
$ cd client && npm i
```

We have the minimal scaffolding of the Adder web-service.

## 2️⃣ Generate TypeScript APIs

Run the following commands to generate the APIs for the
server.
The APIs will be generated under `~/case-studies/Adder/src`.

```bash
$ cd ~
$ python -m codegen \
    ~/protocols/Adder.scr                 \ # use this Scribble file
    Adder                                 \ # generate Adder protocol
    Svr                                   \ # for Svr role
    node                                  \ # targeting Node endpoint
    -o ~/case-studies/SimplerAdder/src    \ # output to `src` path
```

Run the following commands to generate the APIs for the
client.
The APIs will be generated under `~/case-studies/SimplerAdder/client/src`.

```bash
# Note that this will target the "client" subdirectory inside Adder.
$ cd ~
 
$ python -m codegen \
    ~/protocols/Adder.scr                         \ # use this Scribble file
    Adder                                         \ # generate Adder protocol
    Client                                        \ # for Client role
    browser                                       \ # targeting browser endpoint
    -s Svr                                        \ # with `Svr` as server role
    -o ~/case-studies/SimplerAdder/client/src     \ # output to `src` path
```

We have the TypeScript APIs required for a communication-safe
implementation of the SimplerAdder web-service. To either of the 
above commands you could've added the `--pass` flag, to make use 
of the Pass-For-All LTS rule.

We proceed to write the application logic for both endpoints,
leveraging the generated APIs to guarantee communication-safety by construction.

## 3️⃣ Implement the server

Create the file, `~/case-studies/SimplerAdder/src/index.ts`, and add the following file content.
You may omit the comments, they are included here simply to guide you and provide context.

```typescript
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

// This function performs the sum after a simulated 2 second delay
const sumAfterTwoSeconds = (x: number, y: number) => new Promise<number>((resolve, reject) => {
    setTimeout(() => resolve(x + y), 2000);
});

const adderServerLogic = (sessionID: string) => {
    const handleRequest = Session.Initial({
        ADD: async (Next: typeof Factory.S1, payload: Message.S0_ADD_payload) => {
            // `Next` is a named constructor for successor states,
            // which is useful for code-completion in editors/IDEs.
            // `x` and `y` are inferred to be numbers.
            const { x, y } = payload;
            const res = await sumAfterTwoSeconds(x, y);

            // Send the RES message with the sum, and continue
            // onto the initial state by recursion.
            return Next.RES({ res }, handleRequest)
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
```

## 4️⃣ Implementing the client

We proceed to implement the React application for the Client endpoint.
We need to implement a React component for each state of the Client's EFSM.
These states are located inside `~/case-studies/SimplerAdder/client/src/Adder/Client`,
and are prefixed with `S__.tsx`, as shown below.

> The `.tsx` file extension denotes that the TypeScript source file
> also uses the [JSX](https://reactjs.org/docs/introducing-jsx.html)
> syntax extension.

There should be only three state components generated.

By convention, we will group our component implementations in a subdirectory.

```bash
$ mkdir ~/case-studies/SimplerAdder/client/src/components
```

### A. Implement EFSM state components

Each of the generated EFSM state components define an
__abstract React class component__.
To instantiate the session runtime for the web application,
we need to define custom implementations of each state component.

The Client's EFSM defines three states:

1. A send state to either send `ADD` or `QUIT` messages
(which is also the initial state);
2. A receive state pending the receipt of the `RES` message with the sum;
3. A terminal state after sending the `QUIT` message.

Inspect each of the generated EFSM state components to figure out
which state identifier corresponds to which state.

#### Implement the send state

The send state corresponds to `S0.tsx`.

```
$ cat ~/case-studies/SimplerAdder/client/src/Adder/Client/S0.tsx

/* ...snip... */

/**
 * __Send state: Possible messages:
 *
 * * __Sends to Svr, ADD__(Payloads.ADD)
 * * __Sends to Svr, QUIT__({})
 */
export default abstract class S0<ComponentState = {}> extends React.Component<Props, ComponentState>
{
/* ...snip... */
```

Create a React class component that inherits from this abstract base class.
Here we name the component `SelectionScreen.tsx`.

```bash
$ cd ~/case-studies/SimplerAdder/client/src/components
$ touch SelectionScreen.tsx
```

Implement the `SelectionScreen` component.
The sample code below displays two text boxes to keep track of the operands
for the `ADD` message, and exposes two buttons labelled _Submit_ and _Quit Adder_
to trigger the `ADD` and `QUIT` selections respectively.

> For simplicity, we will use the `localStorage` API to keep track
> of the operands submitted to the Adder service. The other case studies
> use the [React Context API](https://reactjs.org/docs/context.html) to propagate the shared data.

```tsx
// SelectionScreen.tsx
import React from 'react';
import S0 from '../Adder/Client/S0';

// This UI component needs to keep track of the numbers entered
// by the user. React components can keep track of mutable state.
type ComponentState = {
    x: number,
    y: number,
};

export default class SelectionScreen extends S0<ComponentState> {

    // To update the internal state, we call `this.setState(obj)`,
    // where `obj` is an object literal mapping property names
    // to their updated values.
    state = {
        x: 0,
        y: 0,
    };

    // The `render` method corresponds to the view function
    // explained in the literature. The view function returns the UI
    // components to be rendered on the DOM.
    render() {

        // `this.ADD` is a component factory that takes a DOM event and a
        // callback and returns a React component with the IO action bound
        // inside. Here, we are building a React component named 'Submit' such that,
        // when the user "clicks" on it, the callback is triggered and returns the
        // payload to send along with the "ADD" message. The payload must be typed as
        // a tuple of two numbers, as per the Scribble protocol specification.
        const Submit = this.ADD('onClick', ev => {
            const { x, y } = this.state;
            localStorage.setItem('operands', `${x},${y}`);
            return { x, y };
        });

        // Likewise, `this.ADD` generates a React component that, when clicked on,
        // sends the "QUIT" message with no payload (denoted by empty tuple).
        const Quit = this.QUIT('onClick', ev => {
            return [];
        });

        return (
            <div>
                <input
                    type='number'
                    placeholder='Num1'

                    // When the user changes their input in this textbox, interpret
                    // the input value as a Number and update the entry for `num1` in
                    // the component state. This allows `this.ADD` to access the latest value
                    // when sending the "ADD" message.

                    onChange={(ev) => this.setState({ x: Number(ev.target.value) })}
                    />
                <input
                    type='number'
                    placeholder='Num2'
                    onChange={(ev) => this.setState({ y: Number(ev.target.value) })}
                    />

                <Submit>
                    {
                    // Any UI component inside the "Submit" component will inherit the
                    // event listeners in the parent, so when the user clicks on the button labelled
                    // 'Submit', the behaviour for `this.ADD` described above will be triggered.
                    }
                    <button>Submit</button>

                </Submit>
                <hr />
                <Quit>
                    <button>Quit Adder</button>
                </Quit>
            </div>
        );
    }
};
```

#### Implement the receive state

The receive state corresponds to `S1.tsx`.

```
$ cat ~/case-studies/SimplerAdder/client/src/Adder/Client/S1.tsx

/* ...snip... */

/**
 * __Receives from Svr.__ Possible messages:
 *
 * * __RES__(Payloads.RES)
 */
export default abstract class S1<ComponentState = {}> extends React.Component<Props, ComponentState>
{
    /* ...snip... */

    abstract RES(payload: Payloads.RES): MaybePromise<void>;
};
```

__Note:__ The abstract class defines an abstract method `RES`,
which functions as a hook,
as it is invoked by the session runtime once the message is received.

Create a React class component that inherits from this abstract base class.
Here we name the component `WaitingScreen.tsx`.

> Recall that the SimplerAdder server takes 2 seconds to respond to an
> addition request. This React component will be rendered whilst __waiting__
> to receive the response from the Adder server, hence it is aptly named
> "WaitingScreen".

```bash
$ cd ~/case-studies/SimplerAdder/client/src/components
$ touch WaitingScreen.tsx
```

Implement the `WaitingScreen` component.
The sample code below displays some waiting text, and when the `RES`
message is received, it displays an alert that logs the sum of the operands.
The operands are accessed through the `localStorage` API in the same way
that they were stored through the `SelectionScreen.tsx` component.

```tsx
// WaitingScreen.tsx
import React from 'react';
import S1, { Payloads } from '../Adder/Client/S1';

export default class WaitingScreen extends S1 {

    RES(payload: Payloads.RES) {
        // Fetch operands from localStorage API.
        const [x, y] = localStorage
                        .getItem('operands')!
                        .split(',')
                        .map(x => Number(x)) as [number, number];

        // Display alert to user
        alert(`${x} + ${y} = ${payload.res}`);
    }

    render() {
        return (
            <div>
                <h2>Waiting for sum...</h2>
            </div>
        );
    }

};
```

#### Implement the terminal state

The terminal state corresponds to `S2.tsx`.

```
$ cat ~/case-studies/SimplerAdder/client/src/Adder/Client/S2.tsx
/* ...snip... */
/**
 * __Terminal state__.
 */
export default abstract class S2<ComponentState = {}> extends React.Component<Props, ComponentState> {
    componentDidMount() {
        this.props.terminate();
    }
}
```

Create a React class component that inherits from this abstract base class.
Here we name the component `EndScreen.tsx`.

```bash
$ cd ~/case-studies/SimplerAdder/client/src/components
$ touch EndScreen.tsx
```

Implement the `EndScreen` component.
The sample code below displays a helpful message and nothing more.
More complex web applications can leverage the `useEffect`
hook to perform any required clean-up when the session terminates.

```tsx
// EndScreen.tsx
import React from 'react';
import S2 from '../Adder/Client/S2';

export default class EndScreen extends S2 {
    render() {
        return (
            <div>
                <h2>Closed Connection to Adder Service</h2>
                <p>Please refresh the window to connect again.</p>
            </div>
        );
    }
}
```

### B. Integrate session runtime into application

React components define a hierarchy of UI views.
By construction from the `create-react-app` scaffolding, the
top of the hierarchy is defined in
`~/case-studies/SimplerAdder/client/src/App.tsx`.

Modify this component so that the main application renders the
session runtime of the Adder protocol for the Client role.
The instantiation of the session runtime requires some additional
React components, which we label with footnotes in the code
and explain later.

> The session runtime itself is also a React component.
> It is responsible for:
> * keeping track of the current EFSM state;
> * rendering the custom implementation of the corresponding
> EFSM state; and
> * ensuring that the IO actions made available on
> the DOM correspond only to the permitted transitions in the
> current EFSM state.

```tsx
// App.tsx
import React from 'react';
import './App.css';

// Import the session runtime component.
import { Client } from './Adder/Client';

// Import our custom state implementations.
import SelectionScreen from './components/SelectionScreen';
import WaitingScreen from './components/WaitingScreen';
import EndScreen from './components/EndScreen';

function App() {
    const origin = window.location.origin;
    const endpoint = origin.replace(/^http/, 'ws');
    return (
        <div className='App'>
        <h1>Simpler Adder Service</h1>
        <Client
            endpoint={endpoint}

            // Map each state identifier to the corresponding
            // concrete state implementation.
            states={{
                S0: SelectionScreen,
                S1: WaitingScreen,
                S2: EndScreen,
            }}

            // {1}
            waiting={
                <div>
                <p>Connection to Server...</p>
                </div>
            }

            // {2}
            connectFailed={
                <div>
                <p>ERROR: cannot connect to Server...</p>
                </div>
            }

            // {3}
            cancellation={(role, reason) => {
                return (
                    <p>{role} cancelled session due to {reason}</p>
                );
            }}
        />
        </div>
    );
}

export default App;
```

* __{1}__ defines the UI to be displayed when waiting for the session to start.

* __{2}__ defines the UI to be displayed if the Client fails to connect to the server.

* __{3}__ defines a function that is invoked whenever the session is cancelled before
reaching the terminal state (e.g. if the Server goes down), and is parameterised with the
role that cancelled the session and the reason (if any). This function renders the UI to be
displayed when the session is cancelled.

## 5️⃣ Test the web-service

We are now in a position to test the SimplerAdder web-service.
Run the following command to build both the server and client endpoints.
The TypeScript Compiler is executed to check for typing violations, and upon
success, compiles both endpoints into JavaScript code that can be executed
by the Node.js runtime and the browser respectively.

```bash
$ cd ~/case-studies/SimplerAdder
$ npm run build
```

Run the following command to start the Adder web-service.

```bash
$ cd ~/case-studies/SimplerAdder
$ npm start
```

Navigate to `http://localhost:8080` on your browser to
use the SimplerAdder service.

Observe that, even though there is a delay between sending the
`ADD` message and receiving the `RES` message, by construction
from the generated APIs, it is impossible for the client to
submit another `ADD` message whilst waiting for the `RES` message.

__Congratulations, you have implemented your first communication-safe
web application!__

## 💡 Optional extensions

We list some ideas for extending the Adder web-service with
modern web programming practices:

* Modernise the UI using external libraries.
Two popular examples are [Material-UI](https://material-ui.com/) and [React-Bootstrap](https://react-bootstrap.github.io/).
* Display the sum on the DOM rather than an alert. You can refer to
the other case studies for how to propagate state using the
[React Context API](https://reactjs.org/docs/context.html),
as well as how to extract common UI elements in individual components
to reuse across different EFSM states.

Both of these ideas are implemented in the more complex Adder found in `~/case-studies/Adder`.
