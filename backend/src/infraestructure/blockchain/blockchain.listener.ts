import { dcaEngine } from "./blockchain.provider.js";
import { io } from "../sockets/index.js";
import logger from "../../config/logger.js";

export const startBlockchainListener = () => {
  dcaEngine.on("PlanCreated", (user, amount, interval) => {
    logger.info(`New DCA Plan from ${user}`);
    io.emit("dca:newPlan", { user, amount, interval });
  });

  dcaEngine.on("PlanExecuted", (user, amount, ts) => {
    logger.info(`Plan executed for ${user}: ${amount}`);
    io.emit("dca:execution", { user, amount, timestamp: Number(ts) });
  });

  dcaEngine.on("PlanStopped", (user) => {
    io.emit("dca:stopped", { user });
  });
};
