pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";

/**
 * @title SkymapTokenMock is just mock ERC827 token implementation used 
 * used in test only.
 *
 */
 
contract SkymapToken is ERC827Token {

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