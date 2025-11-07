import { es } from "./es";
import { en } from "./en";
import { pt } from "./pt";

export const LANGUAGES = { es, en, pt };

export type LangCode = keyof typeof LANGUAGES;

export function getLang(lang: LangCode) {
  return LANGUAGES[lang];
}
