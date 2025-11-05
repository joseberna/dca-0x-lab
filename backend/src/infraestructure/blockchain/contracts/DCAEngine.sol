// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DCAEngine is Ownable {
    struct Plan {
        uint256 amountPerInterval;
        uint256 interval;
        uint256 lastExecution;
        bool active;
    }

    IERC20 public stableToken;

    mapping(address => Plan) public plans;
    mapping(address => uint256) public totalInvested;

    event PlanCreated(address indexed user, uint256 amount, uint256 interval);
    event PlanExecuted(address indexed user, uint256 amount, uint256 timestamp);
    event PlanStopped(address indexed user);

    constructor(address _stableToken) Ownable(msg.sender) {
        stableToken = IERC20(_stableToken);
    }

    function createPlan(uint256 _amountPerInterval, uint256 _interval) external {
        require(_amountPerInterval > 0, "Amount must be > 0");
        require(_interval >= 1 days, "Min interval 1 day");
        plans[msg.sender] = Plan(_amountPerInterval, _interval, block.timestamp, true);
        emit PlanCreated(msg.sender, _amountPerInterval, _interval);
    }

    function stopPlan() external {
        require(plans[msg.sender].active, "No active plan");
        plans[msg.sender].active = false;
        emit PlanStopped(msg.sender);
    }

    function executePlan(address _user) public {
        Plan storage plan = plans[_user];
        require(plan.active, "Plan not active");
        require(block.timestamp >= plan.lastExecution + plan.interval, "Too soon");

        plan.lastExecution = block.timestamp;

        // Transfer the funds from the user (requires prior approve)
        stableToken.transferFrom(_user, address(this), plan.amountPerInterval);
        totalInvested[_user] += plan.amountPerInterval;

        emit PlanExecuted(_user, plan.amountPerInterval, block.timestamp);
    }

    function getUserPlan(address _user) external view returns (Plan memory) {
        return plans[_user];
    }

    function withdrawToken(uint256 _amount) external onlyOwner {
        stableToken.transfer(owner(), _amount);
    }
}
