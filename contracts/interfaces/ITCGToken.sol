// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

// TCGToken interface
interface ITCGToken is IERC20, IERC20Permit {
    // ownable interface
    function owner() external view returns (address);

    function renounceOwnership() external;

    function transferOwnership(address newOwner) external;

    // snapshot interface
    function snapshot() external returns (uint256);

    function balanceOfAt(
        address account,
        uint256 snapshotId
    ) external view returns (uint256);

    function totalSupplyAt(uint256 snapshotId) external view returns (uint256);

    // ERC20Votes interface
    function checkpoints(
        address account,
        uint32 pos
    ) external view returns (uint32 fromBlock, uint224 votes);

    function numCheckpoints(address account) external view returns (uint32);

    function delegates(address account) external view returns (address);

    function getVotes(address account) external view returns (uint256);

    function getPastVotes(
        address account,
        uint256 blockNumber
    ) external view returns (uint256);

    function getPastTotalSupply(
        uint256 blockNumber
    ) external view returns (uint256);

    function delegate(address delegatee) external;

    function delegateBySig(
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
