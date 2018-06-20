const Skymap = artifacts.require("SkymapToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const intitialSupply = 510000000 * (10 ** 18);
const amount = 1 * (10 ** 18);
const zero = new BigNumber(0);

contract('SkymapToken', function ([owner, user1, user2, nominatedBeneficier, _]) {

  beforeEach(async function () {
    this.token = await Skymap.new(owner);
  });

  it("..init supply is assigned to nominated beneficier", async function () {
    let token = await Skymap.new(nominatedBeneficier, {from: owner});
    let balance = await token.balanceOf(nominatedBeneficier);
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
    await this.token.transfer(user1, amount, {from: owner});
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
    await this.token.approve(user1, amount, {from: owner});
    await this.token.transferFrom(owner, user1, amount, {from: user1});
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.approve(user2, amount, {from: owner});
    
    await this.token.pause({ from: owner});
    let allowance = await this.token.allowance(owner, user2);
    allowance.should.be.bignumber.equal(amount);

    await this.token.transferFrom(owner, user2, amount, {from: user2}).should.be.fulfilled;
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

});