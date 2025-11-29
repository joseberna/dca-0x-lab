"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSyncWallet } from "../store/useDCAStore";
import Link from "next/link";
import { useLangStore } from "../store/useLangStore";
import { LangCode, getLang } from "../i18n";

export default function Navbar() {
  useSyncWallet();
  const { lang, setLang } = useLangStore();
  const t = getLang(lang);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-hover">
              <span className="text-xl font-bold text-primary-foreground">₿</span>
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">
              {t.navbar.title}
            </span>
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
  );
}
