const Skymap = artifacts.require("SkymapToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const nominatedBeneficier = '0x25278cD85046CB44C673dd98ab5A18d582f03d79';
const intitialSupply = 510000000 * (10 ** 18);
const amount = 1 * (10 ** 18);
const zero = new BigNumber(0);

contract('SkymapToken', function ([owner, user1, user2]) {

  beforeEach(async function () {
    this.token = await Skymap.new(owner);
  });

  it("..init supply is assigned to nominated beneficier", async function () {
    let token = await Skymap.new(nominatedBeneficier);
    let balance = await token.balanceOf(nominatedBeneficier);
    balance.should.be.bignumber.equal(intitialSupply);
  });

  it("..is pausable and only owner can pause and unpause token", async function () {
    let tx = await this.token.pause({from: user1}).should.be.rejectedWith(Error);
    tx = await this.token.pause({ from: owner});
    txSuccess(tx);
    tx = await this.token.unpause({from: user1}).should.be.rejectedWith(Error);
    tx = await this.token.unpause({ from: owner});
    txSuccess(tx);
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

  it("..transferFrom is pausable", async function () {
    await this.token.approve(user1, amount, {from: owner});
    await this.token.transferFrom(owner, user1, amount, {from: user1});
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.approve(user2, amount, {from: owner});
    
    await this.token.pause({ from: owner});
    let allowance = await this.token.allowance(owner, user2);
    allowance.should.be.bignumber.equal(amount);

    await this.token.transferFrom(owner, user2, amount, {from: user2}).should.be.rejectedWith(Error);
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(zero);

    await this.token.unpause({ from: owner});

    await this.token.transferFrom(owner, user2, amount, {from: user2});
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(amount);
  });

  it("..transferFrom is pausable", async function () {
    await this.token.approve(user1, amount, {from: owner});
    await this.token.transferFrom(owner, user1, amount, {from: user1});
    let balance = await this.token.balanceOf(user1);
    balance.should.be.bignumber.equal(amount);
    await this.token.approve(user2, amount, {from: owner});
    
    await this.token.pause({ from: owner});
    let allowance = await this.token.allowance(owner, user2);
    allowance.should.be.bignumber.equal(amount);

    await this.token.transferFrom(owner, user2, amount, {from: user2}).should.be.rejectedWith(Error);
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(zero);

    await this.token.unpause({ from: owner});

    await this.token.transferFrom(owner, user2, amount, {from: user2});
    balance = await this.token.balanceOf(user2);
    balance.should.be.bignumber.equal(amount);
  });



});

const txSuccess = function(tx) {
  let success = new BigNumber(1);
  let status = new BigNumber(tx.receipt.status);
  status.should.be.bignumber.equal(success);
}

const txFailure = function(tx) {
  let success = new BigNumber(0);
  let status = new BigNumber(tx.receipt.status);
  status.should.be.bignumber.equal(success);
}