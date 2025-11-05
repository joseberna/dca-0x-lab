"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDCAStore } from "../../store/useDCAStore";
import NavbarPlans from "../../components/NavBarPlans";


export default function PlansPage() {
    const { address, isConnected } = useDCAStore();
    const [plans, setPlans] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!isConnected) {
            router.push("/");
            return;
        }

        const fetchPlans = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dca/wallet/${address}`);
                setPlans(res.data.data);
            } catch (err) {
                console.error("Error fetching plans:", err);
            }
        };

        fetchPlans();
    }, [isConnected, address, router]);

    const openPlanDetail = (plan: any) => {
        // pasamos el objeto completo 
        localStorage.setItem("selectedPlan", JSON.stringify(plan));
        
        router.push(`/plans/${plan._id}`)
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarPlans />
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">📋 Mis Planes DCA</h2>

                {plans.length === 0 ? (
                    <p className="text-gray-500">No tienes planes activos aún.</p>
                ) : (
                    <div className="grid gap-4">
                        {plans.map((p) => (
                            <div
                                key={p._id}
                                onClick={() => openPlanDetail(p)}
                                className="p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{p.tokenFrom} → {p.tokenTo}</h3>
                                        <p className="text-gray-500 text-sm">
                                            {p.totalOperations} compras / cada {p.intervalDays} días
                                        </p>
                                    </div>
                                    <span className="text-indigo-600 font-semibold">
                                        {p.amountPerInterval.toFixed(2)} {p.tokenFrom}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
