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
        {/* Hero Section - Simplified */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8 fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">{t.home.title}</span>
            </h1>
            <p className="text-base text-foreground/60 max-w-2xl mx-auto">
              {t.home.subtitle.replace("{network}", "Sepolia & Polygon")}
            </p>
          </div>

          {/* Form Section - PRINCIPAL */}
          <div className="mb-16">
            <DCAPlanForm />
          </div>

          {/* Features - Below form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card glass glow-hover p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t.features.nonCustodial.title}
              </h3>
              <p className="text-sm text-foreground/60">
                {t.features.nonCustodial.description}
              </p>
            </div>

            <div className="card glass glow-hover p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t.features.automated.title}
              </h3>
              <p className="text-sm text-foreground/60">
                {t.features.automated.description}
              </p>
            </div>

            <div className="card glass glow-hover p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t.features.transparent.title}
              </h3>
              <p className="text-sm text-foreground/60">
                {t.features.transparent.description}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
