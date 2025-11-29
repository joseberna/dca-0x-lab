import { useState, useEffect } from "react";
import DynamicNavbar from "../components/DynamicNavbar";
import { useLangStore } from "../store/useLangStore";
import { getLang } from "../i18n";
import axios from "axios";
import Link from "next/link";
import { useAccount } from "wagmi";

type Plan = {
  _id: string;
  contractId: number;
  tokenTo: string;
  totalAmount: number;
  amountPerInterval: number;
  intervalSeconds: number;
  totalOperations: number;
  executedOperations: number;
  status: string;
};

export default function MyPlans() {
  const { lang } = useLangStore();
  const t = getLang(lang);
  const { address, isConnected } = useAccount();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchPlans();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchPlans = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      // In a real app, we should filter by user address in the backend
      // For now, we fetch all and filter here or assume the backend handles it if we passed the address
      // But looking at the backend code, it returns all plans. Let's filter client side for now if needed,
      // or just show all for this PoC. Ideally we pass ?user=address
      const response = await axios.get(`${apiUrl}/api/dca/plans`);
      
      // Filter by user address if the API returns all plans
      const userPlans = response.data.data.filter((p: any) => 
        p.userAddress.toLowerCase() === address?.toLowerCase()
      );
      
      setPlans(userPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatUSDC = (micros: number) => (micros / 1e6).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <DynamicNavbar
        title={t.pages.myPlans.title}
        breadcrumbs={[
          { label: t.nav.home, href: "/" },
          { label: t.pages.myPlans.title },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-foreground/60 text-lg">Please connect your wallet to view your plans.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/60 text-lg mb-6">{t.pages.myPlans.noPlans}</p>
            <Link 
              href="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-200"
            >
              {t.pages.myPlans.createPlan}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan._id}
                className="group relative overflow-hidden rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                        <span className="font-bold text-primary">
                          {plan.tokenTo === "WBTC" ? "₿" : "Ξ"}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-foreground">
                          {plan.tokenTo}
                        </h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          plan.status === 'active' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-foreground/40">
                      #{plan.contractId}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">{t.pages.myPlans.budget}</span>
                      <span className="font-mono font-medium text-foreground">
                        {formatUSDC(plan.totalAmount)} USDC
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">{t.pages.myPlans.progress}</span>
                        <span className="text-foreground">
                          {plan.executedOperations} / {plan.totalOperations}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${(plan.executedOperations / plan.totalOperations) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/plans/${plan._id}`}
                    className="block w-full py-2.5 text-center rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/30 text-sm font-medium transition-all duration-200"
                  >
                    {t.pages.myPlans.viewDetail}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
