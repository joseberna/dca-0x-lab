import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller.ts";

const router = Router();
const controller = new WalletController();

/**
 * 💼 Wallet routes
 */
router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.delete("/:address", controller.delete.bind(controller));

export default router;
