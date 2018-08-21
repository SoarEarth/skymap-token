const Skymap = artifacts.require("SkymapToken");
const Crowdsale = artifacts.require("AllowanceCrowdsaleImpl");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('SkymapToken', function ([owner, user1, user2, user3, nominatedBeneficier, crowdsaleWallet, _]) {

  const intitialSupply = 350000000 * (10 ** 18);
  const amount = 1 * (10 ** 18); // 1SKYM
  const zero = new BigNumber(0);
  const rate = 3500; // rate 3500SKYM per ETH
  const crowdsaleAllowance = 1000000 * (10 ** 18); // 1,000,000 SKYM

  beforeEach(async function () {
    this.token = await Skymap.new(nominatedBeneficier, { from: owner });
  });

  it("..init supply is assigned to nominated beneficier", async function () {
    let balance = await this.token.balanceOf(nominatedBeneficier);
    balance.should.be.bignumber.equal(intitialSupply);
  });

  it("..is pausable and only owner can unpause and pause token", async function () {
    let paused = await this.token.paused();
    paused.should.be.true;
    await this.token.unpause({ from: user1 }).should.be.rejectedWith(Error);

    await this.token.unpause({ from: owner }).should.be.fulfilled;
    paused = await this.token.paused();
    paused.should.be.false;

    await this.token.pause({ from: user1 }).should.be.rejectedWith(Error);
    await this.token.pause({ from: owner });

    paused = await this.token.paused();
    paused.should.be.true;

  });

  it("..transfer is pausable", async function () {
    await this.token.unpause({ from: owner })
    await this.token.transfer(user1, amount, { from: nominatedBeneficier });
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.pause({ from: owner });
    await this.token.transfer(user2, amount, { from: user1 }).should.be.rejectedWith(Error);;
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(zero);
    await this.token.unpause({ from: owner });
    await this.token.transfer(user2, amount, { from: user1 });
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(amount);
    balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(zero);
  });

  it("..approval is pausable", async function () {
    await this.token.unpause({ from: owner })
    await this.token.approve(user1, amount, { from: owner });
    let allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    await this.token.increaseApproval(user1, amount, { from: owner });
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(2 * amount);
    await this.token.decreaseApproval(user1, amount, { from: owner });
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);

    await this.token.pause({ from: owner });

    await this.token.approve(user1, zero, { from: owner }).should.be.rejectedWith(Error);
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    await this.token.increaseApproval(user1, amount, { from: owner }).should.be.rejectedWith(Error);
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);
    await this.token.decreaseApproval(user1, amount, { from: owner }).should.be.rejectedWith(Error);
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(amount);

    await this.token.unpause({ from: owner });

    await this.token.approve(user1, zero, { from: owner });
    allowance = await this.token.allowance(owner, user1);
    allowance.should.be.bignumber.equal(zero);
  });

  it("..transferFrom is pausable", async function () {
    await this.token.unpause({ from: owner })
    await this.token.approve(user1, amount, { from: nominatedBeneficier });
    await this.token.transferFrom(nominatedBeneficier, user1, amount, { from: user1 });
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.approve(user2, amount, { from: nominatedBeneficier });

    await this.token.pause({ from: owner });
    let allowance = await this.token.allowance(nominatedBeneficier, user2);
    allowance.should.be.bignumber.equal(amount);

    await this.token.transferFrom(nominatedBeneficier, user2, amount, { from: user2 }).should.be.rejectedWith(Error);
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(zero);
  });

  it("..token is in distribution state after deployment", async function () {
    let distributionFinished = await this.token.distributionFinished();
    distributionFinished.should.be.false;
  });

  it("..owner can add and remove distributor", async function () {
    await this.token.addDistributorAddress(user1, { from: owner }).should.be.fulfilled;
    let distributor = await this.token.distributor(user1);
    distributor.should.be.true;

    await this.token.removeDistributorAddress(user1, { from: owner }).should.be.fulfilled;
    distributor = await this.token.distributor(user1);
    distributor.should.be.false;
  });

  it("..only owner can add and remove distributor", async function () {
    await this.token.addDistributorAddress(user1, { from: owner }).should.be.fulfilled;

    await this.token.addDistributorAddress(user2, { from: user1 }).should.be.rejectedWith(Error);
    let distributor = await this.token.distributor(user2);
    distributor.should.be.false;
    await this.token.removeDistributorAddress(user1, { from: user1 }).should.be.rejectedWith(Error);
    distributor = await this.token.distributor(user1);
    distributor.should.be.true;
  });


  it("..distributors can manipulate with token in paused state", async function () {
    let paused = await this.token.paused();
    paused.should.be.true;
  
    await this.token.addDistributorAddress(nominatedBeneficier, { from: owner });
    await this.token.addDistributorAddress(user1, { from: owner });
    
    await this.token.approve(user1, amount, {from: nominatedBeneficier}).should.be.fulfilled;
    let allowance = await this.token.allowance(nominatedBeneficier, user1);
    allowance.should.be.bignumber.equal(amount);
    
    await this.token.increaseApproval(user1, amount, {from: nominatedBeneficier}).should.be.fulfilled;
    allowance = await this.token.allowance(nominatedBeneficier, user1);
    allowance.should.be.bignumber.equal(2 * amount);

    await this.token.decreaseApproval(user1, amount, {from: nominatedBeneficier}).should.be.fulfilled;
    allowance = await this.token.allowance(nominatedBeneficier, user1);
    allowance.should.be.bignumber.equal(amount);

    await this.token.transfer(user3, amount, { from: nominatedBeneficier }).should.be.fulfilled;
    let balance = await this.token.balanceOf(user3);
    balance.should.be.bignumber.equal(amount);
   
    await this.token.transferFrom(nominatedBeneficier, user2, amount, { from: user1 }).should.be.fulfilled;
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(amount);
  });


  it("..public crowdsale can distribute approved tokens when paused", async function () {
    let paused = await this.token.paused();
    paused.should.be.true;
    let crowdsale = await Crowdsale.new(rate, crowdsaleWallet, this.token.address, nominatedBeneficier);
  
    await this.token.addDistributorAddress(nominatedBeneficier, { from: owner });
    await this.token.addDistributorAddress(crowdsale.address, { from: owner });
    
    await this.token.approve(crowdsale.address, crowdsaleAllowance, {from: nominatedBeneficier});
    let allowance = await this.token.allowance(nominatedBeneficier, crowdsale.address);
    allowance.should.be.bignumber.equal(crowdsaleAllowance);
    let etherInWei = new BigNumber(100);

    await crowdsale.sendTransaction({ value: etherInWei, from: user1 });
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(rate * etherInWei);
  });

});