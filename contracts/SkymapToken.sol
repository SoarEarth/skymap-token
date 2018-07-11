pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
 * @title SkymapToken
 * @dev Implementation of ERC827Token with ability to pause transfers and approvals 
 * but approvedToken still will available to transfer to allow distribution during presale
 * and public sale in paused state. Only owner will have ability to approve token for transfer
 * in pause state.
 * The paused methods are copied from openzeppelin PauseableToken.
 *
 */
 
contract SkymapToken is StandardToken, Pausable {

    string public constant symbol = "SKYM";
    string public constant name = "Skymap";
    uint8 public constant decimals = 18;
    uint public INITIAL_SUPPLY = 510000000 * (uint(10) ** decimals);

    mapping (address => bool) public distributors;
    bool public distributionFinished;

    //todo
    // add events when distributor is addedd and removed
    // write tests to cover all situations

    constructor(address beneficier) public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[beneficier] = INITIAL_SUPPLY;
        distributionFinished = false;
        paused = true;
        emit Transfer(0x0, beneficier, INITIAL_SUPPLY);
    }

    modifier whenNotPausedOrDistributor() {
        require(!paused || (!distributionFinished && distributors[msg.sender] == true));
        _;
    }

    modifier whenDistributionNotFinished() {
        require(!distributionFinished);
        _;
    }

    function addDistributorAddress (address _address) public onlyOwner whenDistributionNotFinished {
        distributors[_address] = true;
    }
    
    function removeDistributorAddress (address _address) public onlyOwner whenDistributionNotFinished {
        distributors[_address] = false;
    }

    function finishDistribution() public onlyOwner whenDistributionNotFinished {
        distributionFinished = true;
    }
    
    function transfer(
        address _to,
        uint256 _value
    )
    public
    whenNotPausedOrDistributor
    returns (bool)
    {
        return super.transfer(_to, _value);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
    public
    whenNotPausedOrDistributor
    returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    )
    public
    whenNotPausedOrDistributor
    returns (bool)
    {
        return super.approve(_spender, _value);
    }

    function increaseApproval(
        address _spender,
        uint _addedValue
    )
    public
    whenNotPausedOrDistributor
    returns (bool success)
    {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(
        address _spender,
        uint _subtractedValue
    )
    public
    whenNotPausedOrDistributor
    returns (bool success)
    {
        return super.decreaseApproval(_spender, _subtractedValue);
    }
}