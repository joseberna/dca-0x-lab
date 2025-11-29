"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import NavbarPlan from "../../components/NavBarPlan";
import { useDCAStore } from "../../store/useDCAStore";
import { useChainId } from "wagmi";

export default function PlanDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useDCAStore();
  const chainId = useChainId();
  
  const [plan, setPlan] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
        // router.push("/"); // Optional: redirect if not connected
        return;
    }

    if (!id || !address) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dca/my-plans/${address}/${id}`);
        
        if (res.data.success) {
            // The backend returns { ...plan, executions: [...] }
            const planData = res.data.data;
            setPlan(planData);
            setExecutions(planData.executions || []);
        }
      } catch (err) {
        console.error("Error fetching plan details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, address, isConnected, router]);

  const getExplorerUrl = (txHash: string) => {
      if (chainId === 11155111) {
          return `https://sepolia.etherscan.io/tx/${txHash}`;
      }
      return `https://polygonscan.com/tx/${txHash}`;
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">Cargando plan...</p>;
  if (!plan) return <p className="text-center text-gray-500 mt-10">Plan no encontrado.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPlan />

      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">📈 Detalle del Plan DCA</h2>

        <div className="p-6 border rounded-xl shadow-sm mb-6 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-gray-500">De</p>
                <p className="font-semibold">{plan.tokenFrom}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Hacia</p>
                <p className="font-semibold">{plan.tokenTo}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Total Compras</p>
                <p className="font-semibold">{plan.totalOperations}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Ejecutadas</p>
                <p className="font-semibold">{plan.executedOperations}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Intervalo</p>
                <p className="font-semibold">{plan.intervalSeconds ? `${plan.intervalSeconds / 60} min` : `${plan.intervalDays} días`}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Monto por compra</p>
                <p className="font-semibold text-indigo-600">{plan.amountPerInterval} {plan.tokenFrom}</p>
            </div>
             <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`px-2 py-1 rounded text-xs font-bold ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {plan.status.toUpperCase()}
                </span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-3">🕒 Historial de Ejecuciones</h3>

        {executions.length === 0 ? (
          <p className="text-gray-500">Aún no hay transacciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm bg-white rounded-lg overflow-hidden">
                <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Tx Hash</th>
                </tr>
                </thead>
                <tbody>
                {executions.map((e: any) => (
                    <tr key={e._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="p-3">{e.amount}</td>
                    <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded ${e.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {e.status}
                        </span>
                    </td>
                    <td className="p-3 text-indigo-600">
                        {e.txHash ? (
                        <a
                            href={getExplorerUrl(e.txHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                        >
                            {e.txHash.slice(0, 10)}...{e.txHash.slice(-4)}
                        </a>
                        ) : (
                        "-"
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
