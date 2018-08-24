pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

/**
 * @title SkymapToken
 * @dev Implementation of ERC20Token using Standard token from OpenZeppelin library
 * with ability to pause transfers and approvals.
 * There is aditional ability to distribute tokens when token is paused for nominated distributors
 * by owner of the token. The distribution can perform until the the owner finishDistribution. 
 * After that distributors doesn't have aditional ability than any other address.
 * The implementation of pauseable methods was inspired in PauseableToken from OpenZeppelin library.
 */
 
contract SkymapToken is PausableToken {

    string public constant symbol = "SKYM";
    string public constant name = "Skymap";
    uint8 public constant decimals = 18;
    uint public INITIAL_SUPPLY = 350000000 * (uint(10) ** decimals);

    constructor(address beneficier) public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[beneficier] = INITIAL_SUPPLY;
        paused = true;
        emit Transfer(0x0, beneficier, INITIAL_SUPPLY);
    }
}