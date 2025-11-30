"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSyncWallet } from "../store/useDCAStore";
import Link from "next/link";
import { useLangStore } from "../store/useLangStore";
import { LangCode, getLang } from "../i18n";
import React from "react";

type Breadcrumb = {
  label: string;
  href?: string;
};

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

interface Props {
  /** Optional page title to show in a sub-header */
  title?: string;
  /** Optional breadcrumbs */
  breadcrumbs?: Breadcrumb[];
  /** Optional actions */
  actions?: Action[];
}

export default function DynamicNavbar({ title, breadcrumbs, actions }: Props) {
  useSyncWallet();
  const { lang, setLang } = useLangStore();
  const t = getLang(lang);

  return (
    <div className="flex flex-col w-full">
      {/* Global Navigation Bar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <img 
                src="/dedlyfi-logo.png" 
                alt="DedlyFi Logo" 
                className="w-10 h-10 object-contain"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-xl gradient-text">
                  DedlyFi
                </span>
                <span className="text-xs text-foreground/50">
                  {t.navbar.title}
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Link 
                href="/plans" 
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
              >
                {t.navbar.myPlans}
              </Link>

              {/* Language Selector */}
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LangCode)}
                className="text-sm bg-secondary border-border text-foreground rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="pt">🇧🇷 PT</option>
                <option value="es">🇪🇸 ES</option>
                <option value="en">🇬🇧 EN</option>
              </select>

              {/* Wallet Button */}
              <div className="glow-hover rounded-lg">
                <ConnectButton 
                  showBalance={false} 
                  chainStatus="icon"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dynamic Page Header (Sub-navbar) */}
      {(title || breadcrumbs || actions) && (
        <div className="bg-secondary/30 border-b border-border/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Title & Breadcrumbs */}
              <div className="flex flex-col gap-1">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex items-center text-xs text-foreground/50 space-x-2">
                    {breadcrumbs.map((bc, i) => (
                      <React.Fragment key={i}>
                        {bc.href ? (
                          <Link href={bc.href} className="hover:text-primary transition-colors">
                            {bc.label}
                          </Link>
                        ) : (
                          <span>{bc.label}</span>
                        )}
                        {i < breadcrumbs.length - 1 && <span>/</span>}
                      </React.Fragment>
                    ))}
                  </nav>
                )}
                
                {title && (
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right: Actions */}
              {actions && actions.length > 0 && (
                <div className="flex items-center gap-3">
                  {actions.map((action, i) => {
                    const baseClass = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center";
                    const variantClasses = {
                      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                      secondary: "bg-secondary text-foreground border border-border hover:bg-secondary/80",
                      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                    };
                    
                    const className = `${baseClass} ${variantClasses[action.variant || 'primary']}`;

                    if (action.href) {
                      return (
                        <Link key={i} href={action.href} className={className}>
                          {action.label}
                        </Link>
                      );
                    }
                    
                    return (
                      <button key={i} onClick={action.onClick} className={className}>
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
