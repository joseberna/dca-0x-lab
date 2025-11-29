import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DynamicNavbar from "../../components/DynamicNavbar";
import { useLangStore } from "../../store/useLangStore";
import { getLang } from "../../i18n";
import axios from "axios";
import { useToast } from "../../hooks/useToast";

type Plan = {
  _id: string;
  contractId: number;
  tokenFrom: string;
  tokenTo: string;
  totalAmount: number;
  amountPerInterval: number;
  intervalSeconds: number;
  totalOperations: number;
  executedOperations: number;
  status: string;
  lastExecution: string;
  nextExecution: string;
  createdAt: string;
};

export default function PlanDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { lang } = useLangStore();
  const t = getLang(lang);
  const toast = useToast();
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.get(`${apiUrl}/api/dca/${id}`);
      setPlan(response.data.data);
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast.error("Error", "Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const formatUSDC = (micros: number) => (micros / 1e6).toFixed(2);
  
  const formatInterval = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);
    
    if (days) return `${days} ${days === 1 ? 'day' : 'days'}`;
    if (hrs) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'}`;
    if (mins) return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    return `${seconds} seconds`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <DynamicNavbar />
        <div className="text-center py-20">
          <p className="text-foreground/60 text-lg">Plan not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DynamicNavbar
        title={`${t.pages.planDetail.title} #${plan.contractId}`}
        breadcrumbs={[
          { label: t.nav.home, href: "/" },
          { label: t.pages.myPlans.title, href: "/plans" },
          { label: `#${plan.contractId}` },
        ]}
        actions={[
          { 
            label: t.pages.planDetail.runNow, 
            onClick: () => toast.info("Coming Soon", "Manual execution will be available soon."),
            variant: 'primary'
          },
          { 
            label: t.pages.planDetail.cancel, 
            onClick: () => toast.info("Coming Soon", "Plan cancellation will be available soon."),
            variant: 'danger'
          },
        ]}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="card glass p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {plan.tokenFrom} → {plan.tokenTo}
                  </h2>
                  <p className="text-sm text-foreground/60">
                    {t.pages.planDetail.created}: {formatDate(plan.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  plan.status === 'active' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>
                  {plan.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-sm text-foreground/60 mb-1">{t.pages.planDetail.budget}</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatUSDC(plan.totalAmount)} USDC
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-sm text-foreground/60 mb-1">{t.pages.planDetail.amountPerTick}</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatUSDC(plan.amountPerInterval)} USDC
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground/60">{t.pages.planDetail.progress}</span>
                    <span className="text-foreground font-medium">
                      {plan.executedOperations} / {plan.totalOperations} {t.pages.planDetail.totalTicks}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${(plan.executedOperations / plan.totalOperations) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Execution History Placeholder */}
            <div className="card glass p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Execution History</h3>
              <div className="text-center py-8 text-foreground/40 text-sm">
                No execution history available yet.
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="card glass p-6">
              <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4">
                Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-foreground/60">{t.pages.planDetail.interval}</span>
                  <span className="text-sm font-medium text-foreground">{formatInterval(plan.intervalSeconds)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-foreground/60">{t.pages.planDetail.totalTicks}</span>
                  <span className="text-sm font-medium text-foreground">{plan.totalOperations}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-foreground/60">{t.pages.planDetail.id}</span>
                  <span className="text-sm font-mono text-foreground/80">#{plan.contractId}</span>
                </div>
              </div>
            </div>

            <div className="card glass p-6">
              <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4">
                Schedule
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-foreground/50 mb-1">{t.pages.planDetail.lastExec}</p>
                  <p className="text-sm font-medium text-foreground">
                    {plan.lastExecution ? formatDate(plan.lastExecution) : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50 mb-1">{t.pages.planDetail.nextExec}</p>
                  <p className="text-sm font-medium text-primary">
                    {plan.nextExecution ? formatDate(plan.nextExecution) : "Finished"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
