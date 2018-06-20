pragma solidity ^0.4.23;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";

contract AllowanceCrowdsaleImpl is AllowanceCrowdsale {

    constructor (
        uint256 _rate,
        address _wallet,
        ERC20 _token,
        address _tokenWallet
    )
    public
    Crowdsale(_rate, _wallet, _token)
    AllowanceCrowdsale(_tokenWallet)
    {
    }

}