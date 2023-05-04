const hre = require('hardhat');
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');


async function getChainId() {
  return new BN(await hre.network.provider.send('eth_chainId', []), 'hex');
}

module.exports = {
  getChainId,
};