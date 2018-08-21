pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
 * @title SkymapToken
 * @dev Implementation of ERC20Token using Standard token from OpenZeppelin library
 * with ability to pause transfers and approvals.
 * There is aditional ability to distribute tokens when token is paused for nominated distributors
 * by owner of the token. The distribution can perform until the the owner finishDistribution. 
 * After that distributors doesn't have aditional ability than any other address.
 * The implementation of pauseable methods was inspired in PauseableToken from OpenZeppelin library.
 */
 
contract SkymapToken is StandardToken, Pausable {

    string public constant symbol = "SKYM";
    string public constant name = "Skymap";
    uint8 public constant decimals = 18;
    uint public INITIAL_SUPPLY = 350000000 * (uint(10) ** decimals);

    mapping (address => bool) private distributors;
    bool public distributionFinished;

    event DistributorAddressAdded(address addr);
    event DistributorAddressRemoved(address addr);

    constructor(address beneficier) public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[beneficier] = INITIAL_SUPPLY;
        distributionFinished = false;
        paused = true;
        emit Transfer(0x0, beneficier, INITIAL_SUPPLY);
    }

    /**
    * @dev Throws if token is paused and distribution is finished  
    * or called by any account that's not distributors.
    */
    modifier whenNotPausedOrDistributor() {
        require(!paused || (!distributionFinished && distributors[msg.sender] == true));
        _;
    }
    /**
    * @dev Throws if distribution is finished
    */
    modifier whenDistributionNotFinished() {
        require(!distributionFinished);
        _;
    }

    /**
    * @dev add an address to the distributors
    * @param _address address
    */
    function addDistributorAddress (address _address) public onlyOwner whenDistributionNotFinished {
        distributors[_address] = true;
        emit DistributorAddressAdded(_address);
    }

    /**
    * @dev remove an address to the distributors
    * @param _address address
    */
    function removeDistributorAddress (address _address) public onlyOwner whenDistributionNotFinished {
        distributors[_address] = false;
        emit DistributorAddressRemoved(_address);
    }

    /**
    * @dev getter to determine if address is in distributors list
    */
    function distributor(address _address) public view whenDistributionNotFinished returns (bool) {
        return distributors[_address];
    }

    /**
    * @dev set the distribution finished and it can not be revert back
    */
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