import { dcaEngine } from "../../blockchain/blockchain.provider.js";
export const createPlan = async (req, res) => {
    try {
        const { amount, interval } = req.body;
        const tx = await dcaEngine.createPlan(amount, interval);
        await tx.wait();
        res.json({ success: true, tx: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const executePlan = async (req, res) => {
    try {
        const { user } = req.body;
        const tx = await dcaEngine.executePlan(user);
        await tx.wait();
        res.json({ success: true, tx: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
