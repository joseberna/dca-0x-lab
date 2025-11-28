"use client";
import Navbar from "../components/Navbar";
import DCAPlanForm from "@components/DCAPlanForm";
import { useLangStore } from "../store/useLangStore";
import { getLang } from "../i18n";

export default function Home() {
  const { lang } = useLangStore();
  const t = getLang(lang);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="relative">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 fade-in">
            {/* Animated gradient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="gradient-text">{t.home.title}</span>
              </h1>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
                {t.home.subtitle.replace("{network}", "Sepolia & Polygon")}
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="card glass glow-hover p-6 text-left">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Non-Custodial
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Tus fondos siempre bajo tu control. Smart contracts verificados.
                  </p>
                </div>

                <div className="card glass glow-hover p-6 text-left">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Automatizado
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Compras automáticas según tu estrategia. Sin intervención manual.
                  </p>
                </div>

                <div className="card glass glow-hover p-6 text-left">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Transparente
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Historial completo on-chain. Trazabilidad total de operaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <DCAPlanForm />

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-foreground/60 mt-1">Disponibilidad</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">0%</div>
              <div className="text-sm text-foreground/60 mt-1">Comisiones</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">100%</div>
              <div className="text-sm text-foreground/60 mt-1">On-Chain</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">∞</div>
              <div className="text-sm text-foreground/60 mt-1">Flexibilidad</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
