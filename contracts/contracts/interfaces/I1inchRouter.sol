// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Interface mínima del router 1inch v6 para integración DCA.
/// @dev Solo se usa para llamadas externas (call data) sin tipado fuerte.
interface I1inchRouter {
    function swap(
        address executor,
        address desc,
        bytes calldata data
    ) external payable returns (uint256 returnAmount, uint256 spentAmount);
}
