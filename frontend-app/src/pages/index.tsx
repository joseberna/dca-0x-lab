"use client";
import Navbar from "../components/Navbar";
import DCAPlanForm from "@components/DCAPlanForm";
import { useLangStore } from "../store/useLangStore";
import { getLang } from "../i18n";

export default function Home() {
  const { lang } = useLangStore();
  const t = getLang(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8 flex flex-col items-center">
        <div className="max-w-3xl text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            {t.home.title}
          </h2>
          <p className="text-gray-500">
            {t.home.subtitle.replace("{network}", "Polygon")}
          </p>
        </div>

        <DCAPlanForm />
      </main>
    </div>
  );
}
