const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  //if env dev set distributor to accounts[0] else set env var
  const distributor =
    process.env.DISTRIBUTOR || (await ethers.getSigners())[0].address;

  const TCGToken = await ethers.getContractFactory("TCGToken");

  console.log("Deploying TCGToken ... by " + distributor);

  const tcgToken = await TCGToken.deploy(distributor);

  await tcgToken.deployed();

  console.log(
    "TCGToken deployed to: " + tcgToken.address + " and minted to " + distributor
  );

  // Write contract address to a configuration file
  const deployFile = {
    tcgTokenAddress: tcgToken.address,
  };
  fs.writeFileSync("deploy.json", JSON.stringify(deployFile));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
