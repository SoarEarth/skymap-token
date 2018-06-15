const Skymap = artifacts.require("SkymapToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const txSuccess = new BigNumber(1);
const txFailure = new BigNumber(0);
const nominatedBeneficier = '0x25278cD85046CB44C673dd98ab5A18d582f03d79';
const intitialSupply = 510000000 * (10 ** 18);

contract('SkymapToken', function ([owner, user1, user2]) {

  beforeEach(async function () {
    this.token = await Skymap.new(owner);
  });

  it("..init supply is assigned to nominated beneficier", async function () {
    let token = await Skymap.new(nominatedBeneficier);
    let balance = await token.balanceOf(nominatedBeneficier);
    balance.should.be.bignumber.equal(intitialSupply);
  });

});