pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

/**
 * @title SkymapToken
 * @dev Implementation of ERC20Token extending OpenZeppelin implementation of PausebleToken
 * 
 */
 
contract SkymapToken is PausableToken {

    string public constant symbol = "SKYM";
    string public constant name = "Skymap";
    uint8 public constant decimals = 18;
    uint public INITIAL_SUPPLY = 510000000 * (uint(10) ** decimals);

    constructor(address beneficier) public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[beneficier] = INITIAL_SUPPLY;
        emit Transfer(0x0, beneficier, INITIAL_SUPPLY);
    }
}