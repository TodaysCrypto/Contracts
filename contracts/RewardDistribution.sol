// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RewardDistribution is AccessControl {
    mapping(address => uint256) public claimable;
    IERC20 public token;

    event Claim(address indexed user, uint256 amount);
    event TokensRecovered(
        address indexed tokenAddress,
        address indexed recipient,
        uint256 amount
    );

    bytes32 public constant SCRIPT_ROLE = keccak256("SCRIPT_ROLE");

    constructor(address tokenAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        token = IERC20(tokenAddress);
    }

    modifier onlyScriptRole() {
        require(hasRole(SCRIPT_ROLE, msg.sender), "Caller not script");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller not admin");
        _;
    }

    function updateClaimable(
        address[] memory users,
        uint256[] memory amounts
    ) external onlyScriptRole {
        require(
            users.length == amounts.length,
            "Input arrays must have the same length"
        );

        for (uint256 i = 0; i < users.length; i++) {
            claimable[users[i]] = claimable[users[i]] + amounts[i];
        }
    }

    function claim() external {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");

        claimable[msg.sender] = 0;
        emit Claim(msg.sender, amount);

        require(token.transfer(msg.sender, amount), "Token transfer failed");
    }

    function recoverTokens(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external onlyAdmin {
        require(
            tokenAddress != address(token),
            "Cannot recover the main token of the contract"
        );

        IERC20 otherToken = IERC20(tokenAddress);

        emit TokensRecovered(tokenAddress, recipient, amount);

        require(
            otherToken.transfer(recipient, amount),
            "Token transfer failed"
        );
    }
}
