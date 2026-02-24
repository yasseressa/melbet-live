import type { Locale } from "@/src/lib/i18n";

export type MatchNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

type GNewsArticle = {
  title: string;
  url: string;
  publishedAt: string;
  source?: { name?: string | null } | null;
};

type GNewsResponse = {
  articles?: GNewsArticle[];
};

export async function fetchMatchNews(input: {
  homeTeam: string;
  awayTeam: string;
  locale: Locale;
}): Promise<MatchNewsItem[]> {
  const key = process.env.FOOTBALL_NEWS_API_KEY?.trim();
  if (!key) return [];

  const base = (process.env.FOOTBALL_NEWS_BASE_URL || "https://gnews.io/api/v4").replace(/\/+$/, "");
  const lang = input.locale === "ar" ? "ar" : "en";
  const query =
    input.locale === "ar"
      ? `${input.homeTeam} OR ${input.awayTeam} OR \u0643\u0631\u0629 \u0627\u0644\u0642\u062f\u0645`
      : `${input.homeTeam} OR ${input.awayTeam} OR football`;

  const url = new URL(`${base}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("lang", lang);
  url.searchParams.set("max", "6");
  url.searchParams.set("sortby", "publishedAt");
  url.searchParams.set("in", "title,description");
  url.searchParams.set("apikey", key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
    if (!res.ok) return [];
    const json = (await res.json()) as GNewsResponse;
    return (json.articles || []).map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source?.name || "News",
      publishedAt: a.publishedAt,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

