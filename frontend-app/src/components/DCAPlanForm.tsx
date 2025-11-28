"use client";
import { useState, useMemo, useEffect } from "react";
import { useAccount, useWriteContract, useChainId } from "wagmi";
import { parseUnits } from "viem";
import DCA_PLAN_MANAGER_ABI from "../abis/DCAPlanManager.json";
import { CONTRACTS } from "../utils/contracts";
import { useLangStore } from "../store/useLangStore";
import { getLang } from "../i18n";
import { getAvailableTokens } from "../utils/getAvailableTokens";

export default function DCAPlanForm() {
  // --- Hooks siempre arriba ---
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const chainId = useChainId();
  const { lang } = useLangStore();
  const t = getLang(lang);

  // --- Estado local ---
  const [isClient, setIsClient] = useState(false);
  const [budget, setBudget] = useState("");
  const [tokenTo, setTokenTo] = useState("ETH");
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

    const allowance = parseUnits(budget, 6);
    const amountPerInterval = allowance / BigInt(divisions);
    const intervalSeconds = parseInt(interval) * 24 * 60 * 60;

    try {
      setLoading(true);
      setStatus(t.status.waitingApproval);

      // 1️⃣ Approve
      await writeContract({
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
        address: CONTRACTS.USDC as `0x${string}`,
        functionName: "approve",
        args: [CONTRACTS.DCA_PLAN_MANAGER, allowance],
      });

      setStatus(t.status.approved);

      // 2️⃣ Create Plan
      await writeContract({
        abi: DCA_PLAN_MANAGER_ABI.abi,
        address: CONTRACTS.DCA_PLAN_MANAGER as `0x${string}`,
        functionName: "createPlan",
        args: [
          CONTRACTS.USDC,
          tokenTo,
          allowance,
          amountPerInterval,
          intervalSeconds,
          parseInt(divisions),
        ],
      });

      setStatus(t.status.created);
    } catch (err: any) {
      setStatus(`${t.status.error}${err.shortMessage || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Previene render SSR mismatched ---
  if (!isClient) {
    return (
      <div className="text-center text-gray-400 text-sm mt-10">
        Loading DCA Form...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleCreate}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-5 border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {t.form.title}
      </h2>
      <p className="text-sm text-gray-500 text-center mb-2">
        {t.form.subtitle}
      </p>

      <div className="space-y-3">
        {/* Presupuesto */}
        <div>
          <label className="text-sm text-gray-600">{t.form.totalBudget}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Token destino dinámico */}
        <div>
          <label className="text-sm text-gray-600">{t.form.targetToken}</label>
          <select
            value={tokenTo}
            onChange={(e) => setTokenTo(e.target.value)}
            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {tokens.length > 0 ? (
              tokens.map((token: any) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} — {token.name}
                </option>
              ))
            ) : (
              <option value="">No tokens disponibles para esta red</option>
            )}
          </select>
        </div>

        {/* Configuración del DCA */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">{t.form.divisions}</label>
            <input
              type="number"
              min="1"
              value={divisions}
              onChange={(e) => setDivisions(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">{t.form.interval}</label>
            <input
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Aviso legal */}
      <div className="p-3 bg-yellow-50 text-xs text-gray-600 rounded-lg border border-yellow-200 whitespace-pre-wrap">
        {t.form.warning(budget, divisions, interval)}
      </div>

      {/* Confirmación */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="w-4 h-4 border-gray-300 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label htmlFor="consent" className="cursor-pointer select-none">
          ✅{" "}
          {lang === "es"
            ? "He leído y entiendo los términos anteriores."
            : lang === "en"
            ? "I have read and understand the above terms."
            : "Li e compreendi os termos acima."}
        </label>
      </div>

      {/* Botón principal */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
          !isFormValid || loading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? t.form.signing : t.form.approveButton}
      </button>

      {/* Estado */}
      {status && (
        <p className="text-sm text-center text-gray-500 whitespace-pre-wrap mt-2">
          {status}
        </p>
      )}

      {!isConnected && (
        <p className="text-xs text-center text-gray-400 mt-2">
          {t.form.connectWallet}
        </p>
      )}
    </form>
  );
}
