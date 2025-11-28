// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDCAFeeModel {
    function calculateFee(address user, uint256 amount, address tokenFrom) external view returns (uint256);
}
