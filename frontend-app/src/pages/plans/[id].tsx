"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function PlanDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [plan, setPlan] = useState<any>(null);
    const [executions, setExecutions] = useState<any[]>([]);

    useEffect(() => {
        // 🔹 Recuperar el plan del localStorage
        const saved = localStorage.getItem("selectedPlan");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPlan(parsed);
            } catch (e) {
                console.error("Error parsing saved plan:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchExecutions = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dca/${id}/executions`);
                setExecutions(res.data.data);
            } catch (err) {
                console.error("Error fetching executions:", err);
            }
        };
        fetchExecutions();
    }, [id]);

    if (!plan) return <p className="text-center text-gray-500 mt-10">Cargando plan...</p>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-2xl font-bold mb-4">📈 Detalle del Plan DCA</h2>

            <div className="p-6 border rounded-xl shadow-sm mb-6 bg-white">
                <p><strong>De:</strong> {plan.tokenFrom}</p>
                <p><strong>Hacia:</strong> {plan.tokenTo}</p>
                <p><strong>Total compras:</strong> {plan.totalOperations}</p>
                <p><strong>Ejecutadas:</strong> {plan.executedOperations}</p>
                <p><strong>Intervalo:</strong> {plan.intervalDays} días</p>
                <p><strong>Monto por compra:</strong> {plan.amountPerInterval} {plan.tokenFrom}</p>
                <p><strong>Status:</strong> <span className="font-semibold text-indigo-600">{plan.status}</span></p>
            </div>

            <h3 className="font-semibold text-lg mb-3">🕒 Ejecuciones realizadas</h3>
            {executions.length === 0 ? (
                <p className="text-gray-500">Aún no se ha ejecutado ninguna compra.</p>
            ) : (
                <table className="w-full border text-sm bg-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Monto</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Tx Hash</th>
                        </tr>
                    </thead>
                    <tbody>
                        {executions.map((e) => (
                            <tr key={e._id} className="border-t hover:bg-gray-50 transition">
                                <td className="p-2">{new Date(e.createdAt).toLocaleString()}</td>
                                <td className="p-2">{e.amount}</td>
                                <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${e.status === "success"
                                                ? "bg-green-100 text-green-700"
                                                : e.status === "failed"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {e.status}
                                    </span>
                                </td>
                                <td className="p-2 text-indigo-600">
                                    {e.txHash ? (
                                        <a
                                            href={`https://polygonscan.com/tx/${e.txHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {e.txHash.slice(0, 10)}...
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
