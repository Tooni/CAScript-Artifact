# Flexible Session-Based Web Programming in TypeScript
A mono-repo for a session type API code generation toolchain for modern web programming.

> This project was originally built for Anson Miu's
> [undergraduate Master's thesis](https://www.imperial.ac.uk/media/imperial-college/faculty-of-engineering/computing/public/1920-ug-projects/Miu,-Anson-(kcm116).pdf)
> at Imperial College London.
> 
> It was forked and extended for Neil Sayers' Master's thesis at Imperial College London.

1. [Getting started](#getting-started)

    * [Repository layout](#layout)

1. [User guide](#user-guide)

    * [Using code generation toolchain](#usage)
    * [Running tests](#tests)
    * [Running case studies](#case-studies)

1. [Other documentation](#other-docs)

---

## <a name="getting-started"></a> 1️⃣ Getting started

### <a name="layout"></a> Repository Layout

- `nuscr` contains [𝝼Scr](https://github.com/tooni/nuscr), for handling multiparty protocol descriptions, a dependency of our toolchain.
- `codegen` contains the source code of our code generator, written in Python, which generates TypeScript code for implementing the provided multiparty protocol.
- `protocols` contains various Scribble protocol descriptions, including those used in the case studies.
- `case-studies` contains 5 case studies of implementing interactive web applications with our toolchain, namely _Noughts and Crosses_, _Travel Agency_, _Battleships_, _Online Wallet_, _Codenames_.
- `web-sandbox` contains configuration files for the web development, e.g. TypeScript configurations and NPM `package.json` files.

## <a name="user-guide"></a> 2️⃣ User guide

### <a name="usage"></a> Using code generation toolchain

Refer to the helptext for detailed information:

```bash
$ python -m codegen --help
```

We illustrate how to use our toolchain to generate TypeScript APIs:

#### __Server-side endpoints__

The following command reads as follows:

```bash
$ python -m codegen protocols/TravelAgency.scr TravelAgency S \
	node -o case-studies/TravelAgency/src
```

1. Generate APIs for role `S` of the `TravelAgency` protocol specified in `protocols/TravelAgency.scr`;

2. Role `S` is implemented as a `node` (server-side) endpoint;

3. Output the generated APIs under the path `case-studies/TravelAgency/src`

#### __Browser-side endpoints__

The following command reads as follows:

```bash
$ python -m codegen protocols/TravelAgency.scr TravelAgency A \
	browser -s S -o case-studies/TravelAgency/client/src
```

1. Generate APIs for role `A` of the `TravelAgency` protocol specified in `protocols/TravelAgency.scr`;

2. Role `A` is implemented as a `browser` endpoint, and assume role `S` to be the server;

3. Output the generated APIs under the path `case-studies/TravelAgency/client/src`

### <a name="tests"></a> Running tests

To run the end-to-end tests:

```bash
$  cd web-sandbox/node
$  npm i
$  cd ../browser
$  npm i
$  cd ../..
$  python -m codegen.tests.system
```

The end-to-end tests verify that

* The toolchain correctly parses the Scribble protocol specification files, and,
* The toolchain correctly generates TypeScript APIs, and,
* The generated APIs can be type-checked by the TypeScript Compiler successfully.

The protocol specification files, describing the multiparty communication, are located in the `protocols` folder.
The generated APIs are saved under `web-sandbox` (which is a sandbox environment set up for the TypeScript Compiler) and are deleted when the test finishes.

### <a name="case-studies"></a> Running case studies

We include five case studies of realistic web applications implemented using the generated APIs.

For example, to generate the APIs for the case study `OnlineWallet`:

```bash
$ cd case-studies/OnlineWallet
$ npm i
$ cd client
$ npm i
$ cd ..
$ npm run build
$ npm start
```

and visit `http://localhost:8080`.

## <a name="other-docs"></a> 3️⃣ Other Documentation

Consult the [wiki](https://github.com/ansonmiu0214/TypeScript-Multiparty-Sessions/wiki) for more documentation.

* [Guide to Implementing Your Own Protocols](https://github.com/ansonmiu0214/TypeScript-Multiparty-Sessions/wiki/Guide-to-Implementing-Your-Own-Protocols)
* [Future Work from 2019/2020 MEng Project](https://github.com/ansonmiu0214/TypeScript-Multiparty-Sessions/wiki/2020-Imperial-MEng-Computing-Individual-Project:-Recap)
