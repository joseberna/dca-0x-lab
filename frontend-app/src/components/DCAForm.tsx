"use client";
import { useState } from "react";
import axios from "axios";
import { useDCAStore } from "../store/useDCAStore";

export default function DCAForm() {
  const { address, isConnected } = useDCAStore();
  const [budget, setBudget] = useState("");
  const [tokenTo, setTokenTo] = useState("BTC");
  const [divisions, setDivisions] = useState("4"); // compras iguales
  const [interval, setInterval] = useState("7"); // días entre compras
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isConnected || !address) return alert("🔗 Conecta tu wallet primero");

    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/dca`, {
        userAddress: address,
        tokenFrom: "USDC",
        tokenTo,
        amountPerInterval: parseFloat(budget) / parseInt(divisions),
        intervalDays: parseInt(interval),
        totalOperations: parseInt(divisions),
      });
      alert("✅ Plan DCA creado correctamente");
    } catch (err: any) {
      alert("❌ Error creando plan DCA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-100 transition hover:shadow-xl"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          💰 Crear Plan DCA
        </h2>
        <p className="text-gray-500 text-sm">
          Divide tu presupuesto en compras periódicas automáticas.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Presupuesto total (en USDC)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Ej: 100"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Criptomoneda destino
          </label>
          <select
            value={tokenTo}
            onChange={(e) => setTokenTo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="MATIC">MATIC</option>
            <option value="SOL">SOL</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Número de compras (divisiones)
          </label>
          <input
            type="number"
            min="1"
            placeholder="Ej: 4"
            value={divisions}
            onChange={(e) => setDivisions(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Intervalo entre compras (días)
          </label>
          <input
            type="number"
            min="1"
            placeholder="Ej: 7"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isConnected || loading}
        className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
          !isConnected
            ? "bg-gray-300 cursor-not-allowed"
            : loading
            ? "bg-indigo-400 cursor-wait"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "⏳ Creando..." : "🚀 Crear Plan DCA"}
      </button>

      {!isConnected && (
        <p className="text-xs text-center text-gray-400 mt-2">
          Conecta tu wallet para habilitar esta acción.
        </p>
      )}
    </form>
  );
}
