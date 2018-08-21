# Soar Skymap token - ethereum smart contract

Preminted ERC20 token with ability to be paused and distribute tokens during pre-sale and public sale by nominated address. After the distribution is done then owner will finish distribution and token will behave like normal pauseable ERC20 token contract.

The token smart contract was implemented using  [OpenZeppelin library](https://github.com/OpenZeppelin/openzeppelin-solidity).

- Symbol: **SKYM**
- Name: **Skymap**
- Decimals: **18**
- Supply: **350,000,000 SKYM**

## Technical stack

#### Smart contract/Solidity
- Truffle

## Prerequisites
In order to run the Skymap, you will need [Node.js](https://nodejs.org) (tested with version 8.x.x). This will include npm, needed to install dependencies.

## Installation and Building

1. Install truffle.
    ```javascript    
    npm install -g truffle
    ```


2. Download and install ethereum client for local development - Ganache Client. This client is recomended because migration script is customised for this setup to compile smart contracts, deploye them to network and in the end to udpate smart contracts defifinition abi and config file in react-app-typescript.
    ```javascript    
    http://truffleframework.com/ganache/
    ```

3. Install yarn.

    ```javascript
    ## MacOS
    brew install yarn

    ## Windows
    https://yarnpkg.com/en/docs/install#windows-tab
    ```

4. Download or clone repository.

5. Install the node dependencies.
    ```javascript
    yarn install
    ```

6. Launch Ganache client

7. Compile and migrate the contracts. This command compile all smart contracts and redeploy them on the network
    ```javascript
    truffle migrate --compile-all --reset
    ```
8. Truffle's own suite is included for smart contracts. Be sure you've compile your contracts before running jest, or you'll receive some file not found errors.
    ```javascript
    // Runs Truffle's test suite for smart contract tests.
    truffle test
    ```
