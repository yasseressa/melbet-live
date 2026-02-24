export type Locale = "ar" | "en";

export function isLocale(x: string): x is Locale {
  return x === "ar" || x === "en";
}

export function pickLang<T>(ar: T, en: T | null | undefined, locale: Locale): T {
  return (locale === "ar" ? ar : (en ?? ar)) as T;
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
