const Skymap = artifacts.require("SkymapToken");
const Crowdsale = artifacts.require("AllowanceCrowdsaleImpl");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('SkymapToken', function ([owner, user1, user2, nominatedBeneficier, crowdsaleWallet, _]) {

  const intitialSupply = 510000000 * (10 ** 18);
  const amount = 1 * (10 ** 18); // 1SKYM
  const zero = new BigNumber(0);
  const rate = 3500; // rate 3500SKYM per ETH
  const crowdsaleAllowance = 1000000 * (10 ** 18); // 1,000,000 SKYM

  beforeEach(async function () {
    this.token = await Skymap.new(nominatedBeneficier, { from: owner});
  });

  it("..init supply is assigned to nominated beneficier", async function () {
    let balance = await this.token.balanceOf(nominatedBeneficier);
    balance.should.be.bignumber.equal(intitialSupply);
  });

  it("..is pausable and only owner can pause and unpause token", async function () {
    let paused = await this.token.paused();
    paused.should.be.false;  
    await this.token.pause({from: user1}).should.be.rejectedWith(Error);
    await this.token.pause({ from: owner});
    
    paused = await this.token.paused();
    paused.should.be.true;  
    await this.token.unpause({from: user1}).should.be.rejectedWith(Error);
    await this.token.unpause({ from: owner});
    
    paused = await this.token.paused();
    paused.should.be.false;
  });
  
  it("..ownership can not be renounce when token is paused", async function () {
    await this.token.pause({ from: owner });
    let paused = await this.token.paused();
    paused.should.be.true;
    await this.token.renounceOwnership({ from: owner }).should.be.rejectedWith(Error);

    await this.token.unpause({ from: owner });
    paused = await this.token.paused();
    paused.should.be.false;
    await this.token.renounceOwnership({ from: owner });
    let newOwner = await this.token.owner();
    newOwner.should.be.equal('0x0000000000000000000000000000000000000000');
    await this.token.pause({ from: owner }).should.be.rejectedWith(Error);
  });

  it("..ownership can be renounce when token is unpaused and then cannot be paused again", async function () {
    let paused = await this.token.paused();
    paused.should.be.false;
    await this.token.renounceOwnership({ from: owner });
    let newOwner = await this.token.owner();
    newOwner.should.be.equal('0x0000000000000000000000000000000000000000');
    await this.token.pause({ from: owner }).should.be.rejectedWith(Error);
    await this.token.transferOwnership(owner, { from: owner }).should.be.rejectedWith(Error);
  });

  it("..transfer is pausable", async function () {
    await this.token.transfer(user1, amount, {from: nominatedBeneficier});
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.pause({ from: owner});
    await this.token.transfer(user2, amount, {from: user1}).should.be.rejectedWith(Error);;
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(zero);
    await this.token.unpause({ from: owner});
    await this.token.transfer(user2, amount, {from: user1});
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(amount);
    balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(zero);
  });

  it("..approval is pausable", async function () {
    await this.token.approve(user1, amount, {from: owner});
    let allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    await this.token.increaseApproval(user1, amount, {from: owner});
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(2 * amount);
    await this.token.decreaseApproval(user1, amount, {from: owner});
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    
    await this.token.pause({ from: owner});

    await this.token.approve(user1, zero, {from: owner}).should.be.rejectedWith(Error);
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    await this.token.increaseApproval(user1, amount, {from: owner}).should.be.rejectedWith(Error);
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    await this.token.decreaseApproval(user1, amount, {from: owner}).should.be.rejectedWith(Error);
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);

    await this.token.unpause({ from: owner});
    
    await this.token.approve(user1, zero, {from: owner});
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(zero);
  });

  it("..transferFrom is not pausable", async function () {
    await this.token.approve(user1, amount, {from: nominatedBeneficier});
    await this.token.transferFrom(nominatedBeneficier, user1, amount, {from: user1});
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.approve(user2, amount, {from: nominatedBeneficier});
    
    await this.token.pause({ from: owner});
    let allowance = await this.token.allowance(nominatedBeneficier, user2);
    allowance.should.be.bignumber.equal(amount);

    await this.token.transferFrom(nominatedBeneficier, user2, amount, {from: user2}).should.be.fulfilled;
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(amount);
  });
  
  it("..owner can approve token in paused state", async function () {
    await this.token.pause({ from: owner});
    await this.token.transferOwnership(nominatedBeneficier, { from: owner});
    await this.token.approveOwner(user1, amount, {from: nominatedBeneficier}).should.be.fulfilled;
    let allowance = await this.token.allowance(nominatedBeneficier, user1);
    allowance.should.be.bignumber.equal(amount);
  });

  it("..only owner can approve token in paused state", async function () {
    await this.token.pause({ from: owner});
    await this.token.transferOwnership(nominatedBeneficier, { from: owner});
    await this.token.approveOwner(user1, amount, {from: owner}).should.be.rejectedWith(Error);
    let allowance = await this.token.allowance(nominatedBeneficier, user1);
    allowance.should.be.bignumber.equal(zero);
  });

  it("..public crowdsale can distribute approved tokens when paused", async function () {
    await this.token.pause({ from: owner});
    await this.token.transferOwnership(nominatedBeneficier, { from: owner});
    let crowdsale = await Crowdsale.new(rate, crowdsaleWallet, this.token.address, nominatedBeneficier);
    await this.token.approveOwner(crowdsale.address, crowdsaleAllowance, {from: nominatedBeneficier});
    let allowance = await this.token.allowance(nominatedBeneficier, crowdsale.address);
    allowance.should.be.bignumber.equal(crowdsaleAllowance);
    let etherInWei = new BigNumber(100);
    
    await crowdsale.sendTransaction({ value: etherInWei, from: user1 });
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(rate * etherInWei);
  });

});