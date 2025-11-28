// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DCAPlanManager
 * @dev Contrato que permite crear y ejecutar planes de DCA multi-token, multi-chain-ready.
 * Soporta integración con routers externos (1inch, Uniswap, etc.) y modelo de comisiones modular.
 */

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/I1inchRouter.sol";
import "./interfaces/IDCAFeeModel.sol";

contract DCAPlanManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Plan {
        address user;
        address tokenFrom;
        address tokenTo;
        uint256 totalAmount;
        uint256 amountPerInterval;
        uint256 executedOperations;
        uint256 totalOperations;
        uint256 intervalSeconds;
        uint256 lastExecution;
        bool active;
    }

    mapping(uint256 => Plan) public plans;
    uint256 public nextPlanId;
    address public feeCollector;
    IDCAFeeModel public feeModel; // modelo de comisiones (plug & play)
    address public oneInchRouter;

    event PlanCreated(uint256 indexed planId, address indexed user, uint256 totalAmount);
    event PlanExecuted(uint256 indexed planId, uint256 executedAt, uint256 fee);
    event PlanCompleted(uint256 indexed planId);
    event FeeModelUpdated(address indexed newModel);

    constructor(address _feeCollector, address _oneInchRouter) {
        feeCollector = _feeCollector;
        oneInchRouter = _oneInchRouter;
        nextPlanId = 1;
    }

    // =========================================================
    //                   CREACIÓN DE PLAN
    // =========================================================

    function createPlan(
        address tokenFrom,
        address tokenTo,
        uint256 totalAmount,
        uint256 amountPerInterval,
        uint256 intervalSeconds,
        uint256 totalOperations
    ) external nonReentrant returns (uint256) {
        require(totalAmount > 0, "Invalid amount");
        require(totalOperations > 0 && amountPerInterval > 0, "Invalid setup");
        require(tokenFrom != tokenTo, "Tokens must differ");

        IERC20(tokenFrom).safeTransferFrom(msg.sender, address(this), totalAmount);

        uint256 planId = nextPlanId++;
        plans[planId] = Plan({
            user: msg.sender,
            tokenFrom: tokenFrom,
            tokenTo: tokenTo,
            totalAmount: totalAmount,
            amountPerInterval: amountPerInterval,
            executedOperations: 0,
            totalOperations: totalOperations,
            intervalSeconds: intervalSeconds,
            lastExecution: block.timestamp,
            active: true
        });

        emit PlanCreated(planId, msg.sender, totalAmount);
        return planId;
    }

    // =========================================================
    //                   EJECUCIÓN DEL PLAN
    // =========================================================

    function executePlan(uint256 planId, bytes calldata swapData) external nonReentrant {
        Plan storage plan = plans[planId];
        require(plan.active, "Plan inactive");
        require(plan.executedOperations < plan.totalOperations, "Plan completed");
        require(block.timestamp >= plan.lastExecution + plan.intervalSeconds, "Interval not reached");

        uint256 amount = plan.amountPerInterval;

        // Aplica comisión (usando el modelo actual)
        uint256 fee = 0;
        if (address(feeModel) != address(0)) {
            fee = feeModel.calculateFee(plan.user, amount, plan.tokenFrom);
        }

        uint256 netAmount = amount - fee;

        if (fee > 0) {
            IERC20(plan.tokenFrom).safeTransfer(feeCollector, fee);
        }

        IERC20(plan.tokenFrom).safeApprove(oneInchRouter, netAmount);

        (bool success, ) = oneInchRouter.call(swapData);
        require(success, "Swap failed");

        plan.executedOperations++;
        plan.lastExecution = block.timestamp;

        emit PlanExecuted(planId, block.timestamp, fee);

        if (plan.executedOperations >= plan.totalOperations) {
            plan.active = false;
            emit PlanCompleted(planId);
        }
    }

    // =========================================================
    //                   ADMIN / CONFIG
    // =========================================================

    function setFeeModel(address _feeModel) external onlyOwner {
        feeModel = IDCAFeeModel(_feeModel);
        emit FeeModelUpdated(_feeModel);
    }

    function setFeeCollector(address _collector) external onlyOwner {
        feeCollector = _collector;
    }

    function setRouter(address _router) external onlyOwner {
        oneInchRouter = _router;
    }

    // =========================================================
    //                   UTILIDADES
    // =========================================================

    function getPlan(uint256 planId) external view returns (Plan memory) {
        return plans[planId];
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
