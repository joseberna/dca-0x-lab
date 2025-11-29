"use client";
import { useState, useMemo, useEffect } from "react";
import { useAccount, useWriteContract, useChainId, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import DCA_ACCOUNTING_ABI from "../abis/DCAAccountingV2.json";
import { getContracts } from "../utils/contracts";
import { useLangStore } from "../store/useLangStore";
import { getLang } from "../i18n";
import { getAvailableTokens } from "../utils/getAvailableTokens";
import logger from "../utils/logger";
import { erc20Abi } from "viem";
import { LoadingOverlay } from "./LoadingOverlay";
import axios from "axios";

export default function DCAPlanForm() {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { lang } = useLangStore();
  const t = getLang(lang);
  const contracts = getContracts(chainId);

  const [isClient, setIsClient] = useState(false);
  const [budget, setBudget] = useState("");
  const [tokenTo, setTokenTo] = useState("WBTC");
  const [divisions, setDivisions] = useState("");
  const [interval, setInterval] = useState("");
  const [intervalUnit, setIntervalUnit] = useState<'days' | 'minutes'>('days');
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
    logger.info("Creating Plan...", { service: 'Frontend', method: 'handleCreate' });
    e.preventDefault();
    if (!isFormValid) return;

    const allowance = parseUnits(budget, 6); // USDC has 6 decimals
    const amountPerInterval = allowance / BigInt(divisions);
    const intervalCalc = BigInt(interval) * BigInt(intervalUnit === 'days' ? 86400 : 60);

    try {
      if (!publicClient) throw new Error("Public client not initialized");
      if (!address) throw new Error("Wallet not connected");

      setLoading(true);
      setStatus(t.status.checkingAllowance);

      // 0️⃣ Check Allowance
      const currentAllowance = await publicClient.readContract({
        address: contracts.USDC as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, contracts.DCA_ACCOUNTING as `0x${string}`]
      });

      if (currentAllowance < allowance) {
        setStatus(t.status.waitingApproval);

        // 1️⃣ Approve USDC
        logger.info("Approving USDC...", { service: 'Frontend', method: 'handleCreate', txHash: contracts.USDC });
        const approveHash = await writeContractAsync({
          abi: erc20Abi,
          address: contracts.USDC as `0x${string}`,
          functionName: "approve",
          args: [contracts.DCA_ACCOUNTING as `0x${string}`, allowance],
        });

        logger.info(`Approve sent: ${approveHash}`, { service: 'Frontend', method: 'approve' });
        setStatus(t.status.waitingConfirmation);
        
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        logger.success("Approve confirmed", { service: 'Frontend', method: 'approve' });
      } else {
        logger.info("Allowance sufficient, skipping approval", { service: 'Frontend', method: 'handleCreate' });
      }

      setStatus(t.status.creatingPlan);

      // 2️⃣ Create Plan
      logger.info("Creating Plan...", {
        service: 'Frontend',
        method: 'createPlan',
        planId: `Budget: ${allowance}, Ticks: ${divisions}`
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
        // gas: BigInt(500000), // Removed manual gas limit, should work if approved
      });

      console.log("Tx Hash:", tx);
      setStatus(`${t.status.created} Hash: ${tx}`);
      
      // Notify backend to index this plan immediately
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        await axios.post(`${apiUrl}/api/dca/sync`, { txHash: tx });
        logger.success("Plan synced with backend", { service: 'Frontend', method: 'createPlan' });
      } catch (syncErr) {
        logger.error("Failed to sync plan with backend", { service: 'Frontend', method: 'createPlan' });
      }
      
      // Keep loading for a moment to show success
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err: any) {
      console.error("Transaction error:", err);
      
      // Better error messages for users
      let errorMessage = "";
      
      if (err.message?.includes("underpriced")) {
        errorMessage = "⚠️ Gas price muy bajo. Por favor, cancela las transacciones pendientes en Metamask e intenta de nuevo.";
      } else if (err.message?.includes("gas limit too high")) {
        errorMessage = "⚠️ El contrato puede tener un error. Verifica que tengas fondos USDC suficientes y que el contrato esté correctamente desplegado.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "💰 Fondos insuficientes para gas. Necesitas más ETH en tu wallet.";
      } else if (err.message?.includes("User rejected") || err.code === 4001) {
        errorMessage = "❌ Transacción cancelada por el usuario.";
      } else if (err.message?.includes("nonce") || err.message?.includes("Nonce")) {
        errorMessage = "🔄 Error de sincronización en Metamask. Ve a: Configuración > Avanzado > Borrar datos de actividad (Clear activity tab data). Esto solucionará el error.";
      } else {
        errorMessage = err.shortMessage || err.message || "Error desconocido";
      }
      
      setStatus(`${t.status.error}${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return <div className="text-center mt-10 text-foreground/50">Loading...</div>;

  return (
    <>
      <LoadingOverlay isLoading={loading} message={status} />
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
                {t.form.interval}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full"
                  placeholder="1"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as 'days' | 'minutes')}
                  className="w-32 bg-input border border-border rounded-lg px-3 py-2"
                >
                  <option value="days">Days</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
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
    </>
  );
}
