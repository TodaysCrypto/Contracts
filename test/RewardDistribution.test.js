const { ethers } = require("hardhat");
const BN = require("bn.js");

describe("RewardDistribution", function () {
  let rewardDistribution;
  let tcgToken;
  let owner;
  let scriptRole;
  let user1;
  let user2;
  const initialSupply = ethers.utils.parseEther("5000000000");

  beforeEach(async function () {
    [owner, scriptRole, user1, user2] = await ethers.getSigners();

    const TCGToken = await ethers.getContractFactory("TCGToken"); // Replace with the actual tcgToken contract name
    tcgToken = await TCGToken.deploy(owner.address);
    await tcgToken.deployed();

    const RewardDistribution = await ethers.getContractFactory(
      "RewardDistribution"
    );
    rewardDistribution = await RewardDistribution.deploy(tcgToken.address);
    await rewardDistribution.deployed();

    // Grant script role to scriptRole signer
    await rewardDistribution.grantRole(
      await rewardDistribution.SCRIPT_ROLE(),
      scriptRole.address
    );
  });

  it("Should fail if length is incorrect", async function () {
    const users = [user1.address];
    const amounts = [
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("100"),
    ];

    await expect(
      rewardDistribution.connect(scriptRole).updateClaimable(users, amounts)
    ).to.be.revertedWith("Input arrays must have the same length");
  });

  it("should update claimable amounts by script role", async function () {
    const users = [user1.address];
    const amounts = [ethers.utils.parseEther("100")];

    await rewardDistribution
      .connect(scriptRole)
      .updateClaimable(users, amounts);

    expect(await rewardDistribution.claimable(user1.address)).to.equal(
      amounts[0]
    );
  });

  it("should not update claimable amounts by non-script role", async function () {
    const users = [user1.address];
    const amounts = [ethers.utils.parseEther("100")];

    await expect(
      rewardDistribution.connect(user1).updateClaimable(users, amounts)
    ).to.be.revertedWith("Caller not script");
  });

  it("should allow users to claim their claimable tcgTokens", async function () {
    const users = [user1.address];
    const amounts = [ethers.utils.parseEther("100")];

    await tcgToken.transfer(
      rewardDistribution.address,
      ethers.utils.parseEther("100")
    );

    await rewardDistribution
      .connect(scriptRole)
      .updateClaimable(users, amounts);

    // Ensure user1's claimable amount is set correctly
    expect(await rewardDistribution.claimable(user1.address)).to.equal(
      amounts[0]
    );

    // Claim tcgTokens for user1
    await rewardDistribution.connect(user1).claim();

    // Check if the claimed tcgTokens are transferred to user1
    expect(await tcgToken.balanceOf(user1.address)).to.equal(amounts[0]);
    expect(await rewardDistribution.claimable(user1.address)).to.equal(0);
  });

  it("should not allow users to claim their claimable tcgTokens if they have none", async function () {
    const users = [user1.address];
    const amounts = [ethers.utils.parseEther("100")];

    await rewardDistribution
      .connect(scriptRole)
      .updateClaimable(users, amounts);

    // Ensure user1's claimable amount is set correctly
    expect(await rewardDistribution.claimable(user1.address)).to.equal(
      amounts[0]
    );

    await expect(rewardDistribution.connect(user2).claim()).to.be.revertedWith(
      "Nothing to claim"
    );
  });

  it("should recover accidentally sent ERC20 tokens", async function () {
    const token = await ethers.getContractFactory("TCGToken"); // Replace with the actual other tcgToken contract name
    const tokenInstance = await token.deploy(owner.address);
    await tokenInstance.deployed();

    const recipient = owner.address;
    const amount = initialSupply;

    // Send other tcgToken to the rewardDistribution contract
    await tokenInstance.transfer(rewardDistribution.address, amount);

    // Recover the accidentally sent tcgTokens
    await rewardDistribution
      .connect(owner)
      .recoverTokens(tokenInstance.address, recipient, amount);

    // Check if the tcgTokens are transferred to the recipient
    expect(await tokenInstance.balanceOf(recipient)).to.equal(amount);
  });

  it("should not allow non-owner to recover accidentally sent ERC20 tokens", async function () {
    const token = await ethers.getContractFactory("TCGToken"); // Replace with the actual other tcgToken contract name
    const tokenInstance = await token.deploy(owner.address);
    await tokenInstance.deployed();

    const recipient = owner.address;
    const amount = initialSupply;

    // Send other tcgToken to the rewardDistribution contract
    await tokenInstance.transfer(rewardDistribution.address, amount);

    // Recover the accidentally sent tcgTokens
    await expect(
      rewardDistribution
        .connect(user1)
        .recoverTokens(tokenInstance.address, recipient, amount)
    ).to.be.revertedWith("Caller not admin");
  });

  it("users able to claim mutiple times", async function () {
    const users = [user1.address, user2.address];
    const amounts = [
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("200"),
    ];

    await tcgToken.transfer(
      rewardDistribution.address,
      ethers.utils.parseEther("300")
    );

    await rewardDistribution
      .connect(scriptRole)
      .updateClaimable(users, amounts);

    // Ensure user1's claimable amount is set correctly
    expect(await rewardDistribution.claimable(user1.address)).to.equal(
      amounts[0]
    );

    // Claim tcgTokens for user1
    await rewardDistribution.connect(user1).claim();

    // Check if the claimed tcgTokens are transferred to user1
    expect(await tcgToken.balanceOf(user1.address)).to.equal(amounts[0]);
    expect(await rewardDistribution.claimable(user1.address)).to.equal(0);

    // Ensure user2's claimable amount is set correctly
    expect(await rewardDistribution.claimable(user2.address)).to.equal(
      amounts[1]
    );

    // Check if the claimed tcgTokens are transferred to user2
    expect(await tcgToken.balanceOf(user2.address)).to.equal(new BN(0));
    expect(await rewardDistribution.claimable(user2.address)).to.equal(
      amounts[1]
    );

    await rewardDistribution
      .connect(scriptRole)
      .updateClaimable(users, amounts);

    await tcgToken.transfer(
      rewardDistribution.address,
      ethers.utils.parseEther("300")
    );

    // Ensure user1's claimable amount is set correctly
    expect(await rewardDistribution.claimable(user1.address)).to.equal(
      amounts[0]
    );

    // Claim tcgTokens for user1
    await rewardDistribution.connect(user1).claim();

    // Check if the claimed tcgTokens are transferred to user1
    expect(await tcgToken.balanceOf(user1.address)).to.equal(amounts[0].mul(2));

    // Ensure user2's claimable amount is set correctly
    expect(await rewardDistribution.claimable(user2.address)).to.equal(
      amounts[1].mul(2)
    );

    // Claim tcgTokens for user2
    await rewardDistribution.connect(user2).claim();

    // Check if the claimed tcgTokens are transferred to user2
    expect(await tcgToken.balanceOf(user2.address)).to.equal(amounts[1].mul(2));

    expect(await rewardDistribution.claimable(user2.address)).to.equal(0);
  });
});
