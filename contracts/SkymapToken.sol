pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

/**
 * @title SkymapToken
 * @dev Implementation of ERC20Token using Standard token from OpenZeppelin library
 * with ability to pause transfers and approvals. Token is paused after deployment.
 */
 
contract SkymapToken is PausableToken {

    string public constant symbol = "SKYM";
    string public constant name = "Skymap";
    uint8 public constant decimals = 18;
    uint public INITIAL_SUPPLY = 350000000 * (uint(10) ** decimals); // 350,000,000 SKYM

    constructor(address beneficier) public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[beneficier] = INITIAL_SUPPLY;
        paused = true;
        emit Transfer(0x0, beneficier, INITIAL_SUPPLY);
    }
}