// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/AggregatorV3Interface.sol";

contract MockOracle is AggregatorV3Interface {
    int256 public price;
    uint8 public _decimals;

    constructor(int256 _price, uint8 decimals_) {
        price = _price;
        _decimals = decimals_;
    }

    function setPrice(int256 _price) external {
        price = _price;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return "Mock Oracle";
    }

    function version() external view override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80 _roundId) external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (_roundId, price, block.timestamp, block.timestamp, _roundId);
    }

    function latestRoundData() external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (1, price, block.timestamp, block.timestamp, 1);
    }
}
