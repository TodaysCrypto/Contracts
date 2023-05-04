const { ethers } = require("hardhat");

const fs = require("fs");

async function main() {
  const deployJson = JSON.parse(fs.readFileSync("deploy.json"));
  const tcgTokenAddress = deployJson.tcgTokenAddress;

  if (!tcgTokenAddress) {
    throw new Error("TCGToken contract address not found in deploy.json");
  }

  const RewardDistribution = await ethers.getContractFactory(
    "RewardDistribution"
  );

  console.log("Deploying RewardDistribution ... by ");

  const rewardDistribution = await RewardDistribution.deploy(tcgTokenAddress);

  await rewardDistribution.deployed();

  console.log("RewardDistribution deployed to: " + rewardDistribution.address);

  deployJson["rewardDistributionAddress"] = rewardDistribution.address;
  fs.writeFileSync("deploy.json", JSON.stringify(deployJson));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
