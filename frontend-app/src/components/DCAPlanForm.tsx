"use client";
import { useState, useMemo, useEffect } from "react";
import { useAccount, useWriteContract, useChainId } from "wagmi";
import { parseUnits } from "viem";
import DCA_ACCOUNTING_ABI from "../abis/DCAAccountingV2.json";
import { getContracts } from "../utils/contracts";
import { useLangStore } from "../store/useLangStore";
import { getLang } from "../i18n";
import { getAvailableTokens } from "../utils/getAvailableTokens";

export default function DCAPlanForm() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract(); // Use Async for better error handling
  const chainId = useChainId();
  const { lang } = useLangStore();
  const t = getLang(lang);
  const contracts = getContracts(chainId);

  const [isClient, setIsClient] = useState(false);
  const [budget, setBudget] = useState("");
  const [tokenTo, setTokenTo] = useState("WBTC");
  const [divisions, setDivisions] = useState("");
  const [interval, setInterval] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => setIsClient(true), []);

  const tokens = getAvailableTokens(chainId);

  const isFormValid = useMemo(() => {
    return (
      isConnected &&
      budget.trim() !== "" &&
      divisions.trim() !== "" &&
      interval.trim() !== "" &&
      parseFloat(budget) > 0 &&
      parseInt(divisions) > 0 &&
      parseInt(interval) > 0 &&
      consent
    );
  }, [isConnected, budget, divisions, interval, consent]);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    if (!isFormValid) return;

    const allowance = parseUnits(budget, 6); // USDC has 6 decimals
    const amountPerInterval = allowance / BigInt(divisions);
    // Interval in seconds (assuming input is days for UX, or seconds for testing?)
    // Let's assume input is MINUTES for testing/PoC, or DAYS for prod.
    // User request didn't specify, but usually days. Let's use MINUTES for easier testing if user wants.
    // Standard: Days. Let's stick to Days * 24 * 60 * 60.
    // For PoC/Demo, maybe allow smaller.
    const intervalSeconds = BigInt(interval) * BigInt(60); // Minutes for demo? Or Days?
    // Let's stick to the previous code: parseInt(interval) * 24 * 60 * 60 (Days)
    // But for testing, 1 day is too long.
    // Let's assume the input is "Seconds" for raw control or "Minutes".
    // The previous code had: parseInt(interval) * 24 * 60 * 60.
    // I will change it to MINUTES for this PoC to make it testable.
    const intervalCalc = BigInt(interval) * BigInt(60); 

    try {
      setLoading(true);
      setStatus(t.status.waitingApproval);

      // 1️⃣ Approve USDC
      console.log("Approving USDC...", contracts.USDC, "Spender:", contracts.DCA_ACCOUNTING);
      await writeContractAsync({
        abi: [
          {
            name: "approve",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [],
          },
        ],
        address: contracts.USDC as `0x${string}`,
        functionName: "approve",
        args: [contracts.DCA_ACCOUNTING as `0x${string}`, allowance],
      });

      setStatus(t.status.approved);

      // 2️⃣ Create Plan
      console.log("Creating Plan...", {
        toToken: tokenTo,
        totalBudget: allowance,
        amountPerTick: amountPerInterval,
        interval: intervalCalc,
        totalTicks: BigInt(divisions)
      });

      const tx = await writeContractAsync({
        abi: DCA_ACCOUNTING_ABI.abi,
        address: contracts.DCA_ACCOUNTING as `0x${string}`,
        functionName: "createPlan",
        args: [
          tokenTo,
          allowance,
          amountPerInterval,
          intervalCalc,
          BigInt(divisions),
        ],
      });

      console.log("Tx Hash:", tx);
      setStatus(`${t.status.created} Hash: ${tx}`);
      
      // Optional: Notify backend to index this plan immediately
      // await axios.post('/api/dca/sync', { txHash: tx });

    } catch (err: any) {
      console.error(err);
      setStatus(`${t.status.error}${err.shortMessage || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return <div className="text-center mt-10 text-foreground/50">Loading...</div>;

  return (
    <form
      onSubmit={handleCreate}
      className="max-w-md mx-auto card glass fade-in"
    >
      <h2 className="text-2xl font-bold text-center gradient-text mb-2">
        {t.form.title}
      </h2>
      <p className="text-sm text-foreground/60 text-center mb-6">
        {t.form.subtitle}
      </p>

      <div className="space-y-4">
        {/* Presupuesto */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t.form.totalBudget} (USDC)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            className="w-full"
            placeholder="100.00"
          />
        </div>

        {/* Token destino */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t.form.targetToken}
          </label>
          <select
            value={tokenTo}
            onChange={(e) => setTokenTo(e.target.value)}
            className="w-full"
          >
            {tokens.map((token: any) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol} — {token.name}
              </option>
            ))}
          </select>
        </div>

        {/* Configuración */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              {t.form.divisions} (Ticks)
            </label>
            <input
              type="number"
              min="1"
              value={divisions}
              onChange={(e) => setDivisions(e.target.value)}
              className="w-full"
              placeholder="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              {t.form.interval} (Min)
            </label>
            <input
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full"
              placeholder="60"
            />
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-xs text-foreground/70 leading-relaxed">
          {t.form.warning(budget, divisions, interval)}
        </p>
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3 mt-4 text-xs text-foreground/70">
        <input
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary/50"
        />
        <label htmlFor="consent" className="cursor-pointer select-none leading-relaxed">
          ✅ {lang === "es" ? "Acepto los términos." : "I accept terms."}
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full mt-6 btn-primary"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="pulse">⏳</span> {t.form.signing}
          </span>
        ) : (
          t.form.approveButton
        )}
      </button>

      {/* Status */}
      {status && (
        <div className="mt-4 p-3 bg-secondary/50 border border-border rounded-lg">
          <p className="text-sm text-center text-foreground/80 break-all">
            {status}
          </p>
        </div>
      )}

      {!isConnected && (
        <p className="text-xs text-center text-foreground/40 mt-4">
          {t.form.connectWallet}
        </p>
      )}
    </form>
  );
}
