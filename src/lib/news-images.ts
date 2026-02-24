export function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);
}

export function buildNewsImageUrl(title: string, lang: "ar" | "en"): string {
  const words = normalizeWords(title).slice(0, 4);
  const baseKeywords = lang === "ar" ? ["كرة", "القدم"] : ["football", "soccer"];
  const query = [...words, ...baseKeywords, "stadium"].join(",");
  return `https://source.unsplash.com/1200x675/?${encodeURIComponent(query)}`;
}
