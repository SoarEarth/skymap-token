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
});