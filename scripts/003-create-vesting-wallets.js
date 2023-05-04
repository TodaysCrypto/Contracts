const { ethers } = require("hardhat");

async function main() {
  const configs = [
    {
      address: "",
      startTimeStamp: 1682380799, //4/24/2023 23:59:59
      duration: 864000, // 10days
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
    {
      address: "",
      startTimeStamp: 1682380799,
      duration: 864000,
    },
  ];

  const TCGVestingWallet = await ethers.getContractFactory("TCGVestingWallet");

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log("Deploying TCGVestingWallet " + i);

    const vestingWallet = await TCGVestingWallet.deploy(
      config.address,
      config.startTimeStamp,
      config.duration
    );

    await vestingWallet.deployed();

    console.log(
      "TCGVestingWallet" +
        i +
        " deployed to: " +
        vestingWallet.address +
        " for " +
        config.address +
        " with start time " +
        config.startTimeStamp +
        " and duration " +
        config.duration +
        " seconds"
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
