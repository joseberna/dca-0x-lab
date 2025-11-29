import { create } from "zustand";
import { LangCode } from "../i18n";

interface LangState {
    lang: LangCode;
    setLang: (lang: LangCode) => void;
}

export const useLangStore = create<LangState>((set) => ({
    lang: "pt", // idioma por defecto
    setLang: (lang) => set({ lang }),
}));
