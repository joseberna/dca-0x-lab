// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDCAFeeModel.sol";

contract FlatFeeModel is IDCAFeeModel {
    uint256 public flatFeeBps = 50; // 0.5%

    function calculateFee(address, uint256 amount, address) external view override returns (uint256) {
        return (amount * flatFeeBps) / 10000;
    }
}
