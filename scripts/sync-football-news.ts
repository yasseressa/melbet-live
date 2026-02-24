import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { NewsLang, PrismaClient } from "@prisma/client";

type NewsArticle = {
  title: string;
  description?: string | null;
  content?: string | null;
  url: string;
  image?: string | null;
  publishedAt: string;
  source?: {
    name?: string | null;
    url?: string | null;
  } | null;
};

type NewsResponse = {
  articles?: NewsArticle[];
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const apiKey = process.env.FOOTBALL_NEWS_API_KEY;
if (!apiKey) {
  throw new Error("FOOTBALL_NEWS_API_KEY is not set");
}

const apiBase = process.env.FOOTBALL_NEWS_BASE_URL || "https://gnews.io/api/v4";
const queryAr = process.env.FOOTBALL_NEWS_QUERY_AR || "كرة القدم OR دوري OR مباراة";
const queryEn = process.env.FOOTBALL_NEWS_QUERY_EN || process.env.FOOTBALL_NEWS_QUERY || "football OR soccer";
const langsRaw = process.env.FOOTBALL_NEWS_LANGS || "ar,en";
const country = process.env.FOOTBALL_NEWS_COUNTRY || "";
const max = Number(process.env.FOOTBALL_NEWS_MAX || 20);
const daysBack = Number(process.env.FOOTBALL_NEWS_DAYS_BACK || 2);

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);
}

function buildNewsImageUrl(title: string, lang: "ar" | "en"): string {
  const words = normalizeWords(title).slice(0, 4);
  const baseKeywords = lang === "ar" ? ["كرة", "القدم"] : ["football", "soccer"];
  const query = [...words, ...baseKeywords, "stadium"].join(",");
  return `https://source.unsplash.com/1200x675/?${encodeURIComponent(query)}`;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toSlug(url: string, langCode: "ar" | "en") {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 14);
  return `news-${langCode}-${hash}`;
}

function buildHtml(article: NewsArticle) {
  const body = article.content || article.description || article.title;
  const safeBody = escapeHtml(body || "");
  const safeUrl = escapeHtml(article.url);
  const sourceName = escapeHtml(article.source?.name || "Source");
  return `<p>${safeBody}</p><p><a href="${safeUrl}" rel="nofollow noopener noreferrer" target="_blank">${sourceName}</a></p>`;
}

async function fetchNews(langCode: "ar" | "en", query: string) {
  const fromDate = addDays(new Date(), -daysBack).toISOString();

  const url = new URL(`${apiBase.replace(/\/$/, "")}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("lang", langCode);
  url.searchParams.set("max", String(max));
  url.searchParams.set("sortby", "publishedAt");
  url.searchParams.set("from", fromDate);
  url.searchParams.set("in", "title,description");
  url.searchParams.set("apikey", apiKey);
  if (country) {
    url.searchParams.set("country", country);
  }

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GNews API failed: ${res.status} ${res.statusText} - ${body}`);
  }

  const json = (await res.json()) as NewsResponse;
  return json.articles || [];
}

async function ensureCategory() {
  const nameAr = "Football News";
  const existing = await prisma.newsCategory.findUnique({
    where: { nameAr },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.newsCategory.create({
    data: {
      nameAr,
      nameEn: "Football News",
    },
    select: { id: true },
  });
  return created.id;
}

async function main() {
  const categoryId = await ensureCategory();

  const wantedLangs = langsRaw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter((x): x is "ar" | "en" => x === "ar" || x === "en");
  const langs = wantedLangs.length > 0 ? wantedLangs : (["ar", "en"] as const);

  let created = 0;
  let updated = 0;
  let total = 0;

  for (const langCode of langs) {
    const sourceLang: NewsLang = langCode === "ar" ? NewsLang.AR : NewsLang.EN;
    const query = langCode === "ar" ? queryAr : queryEn;
    const articles = await fetchNews(langCode, query);
    total += articles.length;

    for (const a of articles) {
      if (!a.url || !a.title || !a.publishedAt) continue;
      const slug = toSlug(a.url, langCode);
      const html = buildHtml(a);
      const publishedAt = new Date(a.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) continue;

      const data = {
        sourceLang,
        titleAr: langCode === "ar" ? a.title : a.title,
        titleEn: langCode === "en" ? a.title : null,
        excerptAr: langCode === "ar" ? a.description || null : null,
        excerptEn: langCode === "en" ? a.description || null : null,
        contentHtmlAr: langCode === "ar" ? html : "<p></p>",
        contentHtmlEn: langCode === "en" ? html : null,
        coverUrl: a.image || buildNewsImageUrl(a.title, langCode),
        publishedAt,
        categoryId,
      };

      const existing = await prisma.news.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (existing) {
        await prisma.news.update({
          where: { id: existing.id },
          data,
        });
        updated += 1;
      } else {
        await prisma.news.create({
          data: { slug, ...data },
        });
        created += 1;
      }
    }
  }

  console.log(`News sync done. langs=${langs.join(",")}, articles=${total}, created=${created}, updated=${updated}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
