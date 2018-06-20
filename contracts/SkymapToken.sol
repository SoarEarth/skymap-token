pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

/**
 * @title SkymapToken
 * @dev Implementation of ERC827Token with ability to pause transfers and approvals 
 * but approvedToken still will available to transfer to allow distribution during presale
 * and public sale in paused state. Only owner will have ability to approve token for transfer
 * in pause state.
 * The paused methods are copied from openzeppelin PauseableToken.
 *
 */
 
contract SkymapToken is ERC827Token, Pausable {

    string public constant symbol = "SKYM";
    string public constant name = "Skymap";
    uint8 public constant decimals = 18;
    uint public INITIAL_SUPPLY = 510000000 * (uint(10) ** decimals);

    constructor(address beneficier) public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[beneficier] = INITIAL_SUPPLY;
        emit Transfer(0x0, beneficier, INITIAL_SUPPLY);
    }
    
    /**
    * @dev Override renounceOwnership to make sure that token will be unpaused
    * when ownership will be renounced
    */
    function renounceOwnership() public onlyOwner whenNotPaused {
        super.renounceOwnership();
    }
    /**
    * @dev Owner is able to approve token for transfer in paused state to allow 
    * distribution tokens during presale and public sale
    */
    function approveOwner(
        address _spender,
        uint256 _value
    )
    public
    whenPaused
    onlyOwner
    returns (bool)
    {
        return super.approve(_spender, _value);
    }

    function transfer(
        address _to,
        uint256 _value
    )
    public
    whenNotPaused
    returns (bool)
    {
        return super.transfer(_to, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    )
    public
    whenNotPaused
    returns (bool)
    {
        return super.approve(_spender, _value);
    }

    function increaseApproval(
        address _spender,
        uint _addedValue
    )
    public
    whenNotPaused
    returns (bool success)
    {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(
        address _spender,
        uint _subtractedValue
    )
    public
    whenNotPaused
    returns (bool success)
    {
        return super.decreaseApproval(_spender, _subtractedValue);
    }
}