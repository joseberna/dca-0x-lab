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
    <nav className="flex justify-between items-center bg-white shadow-sm px-8 py-4 border-b border-gray-100">
      <Link href="/" className="font-bold text-xl text-gray-800 tracking-tight">
        {t.navbar.title}
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/plans" className="text-sm text-indigo-600 hover:underline">
          {t.navbar.myPlans}
        </Link>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as LangCode)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value="pt">🇧🇷</option>
          <option value="es">🇪🇸</option>
          <option value="en">🇬🇧</option>
        </select>

        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </nav>
  );
}
