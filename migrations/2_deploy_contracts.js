var SkymapToken = artifacts.require("./SkymapToken.sol");

const owner = web3.eth.accounts[0];
const nominatedBeneficier = '0x25278cD85046CB44C673dd98ab5A18d582f03d79';

module.exports = function(deployer) {
  deployer.deploy(SkymapToken, nominatedBeneficier);
};
