"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSyncWallet } from "../store/useDCAStore";
import Link from "next/link";

export default function Navbar() {
  useSyncWallet();

  return (
    <nav className="flex justify-between items-center bg-white shadow-sm px-8 py-4 border-b border-gray-100">
      <Link href="/" className="font-bold text-xl text-gray-800 tracking-tight">
        💸 <span className="text-indigo-600">DCA Dashboard</span>
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/plans" className="text-sm text-indigo-600 hover:underline">
          Mis Planes
        </Link>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </nav>
  );
}
