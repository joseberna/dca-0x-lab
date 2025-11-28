"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import axios from "axios";
import DCA_PLAN_MANAGER_ABI from "../abis/DCAPlanManager.json";
import { CONTRACTS } from "../utils/contracts";

const CONTRACT_ADDRESS = CONTRACTS.DCA_PLAN_MANAGER;
const TOKEN_ADDRESS = CONTRACTS.USDC;

export default function CreatePlanForm({ userAddress }: { userAddress: string }) {
  const [amount, setAmount] = useState("");
  const [tokenTo, setTokenTo] = useState("ETH");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // --- wagmi hooks ---
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: txLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // --- handle plan creation ---
  const handleCreatePlan = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 1️⃣ Aprobar gasto de tokens
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
        address: TOKEN_ADDRESS,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, parseEther(amount)],
      });

      // 2️⃣ Crear plan en el contrato
      await writeContract({
        abi: DCA_PLAN_MANAGER_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "createPlan",
        args: [
          TOKEN_ADDRESS, // tokenFrom
          tokenTo,       // tokenTo
          parseEther(amount), // amount total
          7, // intervalDays (ejemplo)
          4, // totalOperations (ejemplo)
        ],
      });

      setTxHash(hash || null);
    } catch (err: any) {
      alert("❌ Error creando plan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- sincronizar con backend cuando la tx se confirma ---
  if (isSuccess && txHash) {
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/plans/sync`, {
      userAddress,
      txHash,
      tokenTo,
      amount,
    });
  }

  return (
    <form
      onSubmit={handleCreatePlan}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        🧩 Crear Plan On-Chain
      </h2>

      <div>
        <label className="block text-gray-600 text-sm mb-1">
          Monto total (USDC)
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">
          Token destino
        </label>
        <select
          value={tokenTo}
          onChange={(e) => setTokenTo(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="ETH">ETH</option>
          <option value="BTC">BTC</option>
          <option value="MATIC">MATIC</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || isPending || txLoading}
        className={`w-full py-2.5 rounded-lg text-white font-medium ${
          loading || isPending || txLoading
            ? "bg-indigo-400 cursor-wait"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading || txLoading ? "⏳ Ejecutando..." : "🚀 Crear Plan On-Chain"}
      </button>

      {txHash && (
        <p className="text-sm text-center text-gray-500 mt-2">
          ✅ Tx confirmada:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline"
          >
            ver en Etherscan
          </a>
        </p>
      )}

      {writeError && (
        <p className="text-sm text-red-500 text-center mt-2">
          {writeError.message}
        </p>
      )}
    </form>
  );
}
