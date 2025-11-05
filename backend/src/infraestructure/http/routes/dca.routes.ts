import express from "express";
import { createPlan, executePlan } from "../controllers/dca.controller.js";
const router = express.Router();

router.post("/create", createPlan);
router.post("/execute", executePlan);

export default router;
