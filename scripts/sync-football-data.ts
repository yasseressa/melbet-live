import "dotenv/config";
import { MatchStatus, PrismaClient } from "@prisma/client";
import { createPrismaMariaDbAdapter } from "../src/lib/prisma-mariadb-adapter.ts";

type ApiTeam = {
  id: number;
  name: string;
  shortName?: string | null;
  tla?: string | null;
  crest?: string | null;
};

type ApiCompetition = {
  id: number;
  name: string;
  emblem?: string | null;
  area?: {
    name?: string | null;
  } | null;
};

type ApiMatch = {
  id: number;
  status: string;
  utcDate: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  competition: ApiCompetition;
};

type MatchesResponse = {
  matches?: ApiMatch[];
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const apiKey = process.env.FOOTBALL_DATA_API_KEY;
if (!apiKey) {
  throw new Error("FOOTBALL_DATA_API_KEY is not set");
}

const apiBase = process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";
const competitionCodes = (process.env.FOOTBALL_DATA_COMPETITIONS || "PL,PD,SA,BL1,FL1,DED")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
const daysPast = Number(process.env.FOOTBALL_DATA_DAYS_PAST || 0);
const daysFuture = Number(process.env.FOOTBALL_DATA_DAYS_FUTURE || 7);

const adapter = createPrismaMariaDbAdapter(databaseUrl);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function normalizeKey(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const competitionArMap: Record<string, string> = {
  "premier league": "الدوري الإنجليزي الممتاز",
  "la liga": "الدوري الإسباني",
  "primera division": "الدوري الإسباني",
  "bundesliga": "الدوري الألماني",
  "ligue 1": "الدوري الفرنسي",
  "serie a": "الدوري الإيطالي",
  "eredivisie": "الدوري الهولندي",
};

const wordArMap: Record<string, string> = {
  real: "ريال",
  madrid: "مدريد",
  barcelona: "برشلونة",
  atletico: "أتلتيكو",
  manchester: "مانشستر",
  united: "يونايتد",
  city: "سيتي",
  liverpool: "ليفربول",
  chelsea: "تشيلسي",
  arsenal: "أرسنال",
  tottenham: "توتنهام",
  bayern: "بايرن",
  dortmund: "دورتموند",
  juventus: "يوفنتوس",
  milan: "ميلان",
  inter: "إنتر",
  napoli: "نابولي",
  paris: "باريس",
  saint: "سان",
  germain: "جيرمان",
  sporting: "سبورتينغ",
  clube: "كلوب",
  club: "كلوب",
  fc: "إف سي",
  cf: "سي إف",
  ac: "إيه سي",
  sc: "إس سي",
  ud: "يو دي",
  de: "دي",
};

function toArabicName(name: string) {
  if (!name) return name;
  if (hasArabic(name)) return name;
  const key = normalizeKey(name);
  if (competitionArMap[key]) return competitionArMap[key];
  const parts = name.split(/[\s\-_/]+/).filter(Boolean);
  const mapped = parts.map((part) => wordArMap[part.toLowerCase()] || null);
  if (mapped.every(Boolean)) {
    return mapped.join(" ");
  }
  return name;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function mapStatus(status: string): MatchStatus {
  const s = status.toUpperCase();
  if (s === "IN_PLAY" || s === "PAUSED") return MatchStatus.LIVE;
  if (s === "FINISHED") return MatchStatus.FINISHED;
  if (s === "POSTPONED" || s === "SUSPENDED" || s === "CANCELLED") return MatchStatus.POSTPONED;
  return MatchStatus.SCHEDULED;
}

function matchSlug(externalId: number) {
  return `fd-${externalId}`;
}

async function fetchMatches() {
  const now = new Date();
  const dateFrom = toDateOnly(addDays(now, -daysPast));
  const dateTo = toDateOnly(addDays(now, daysFuture));

  const url = new URL(`${apiBase.replace(/\/$/, "")}/matches`);
  url.searchParams.set("dateFrom", dateFrom);
  url.searchParams.set("dateTo", dateTo);
  if (competitionCodes.length > 0) {
    url.searchParams.set("competitions", competitionCodes.join(","));
  }

  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": apiKey,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data API failed: ${res.status} ${res.statusText} - ${body}`);
  }

  const json = (await res.json()) as MatchesResponse;
  return json.matches || [];
}

async function upsertCompetition(comp: ApiCompetition, cache: Map<number, string>) {
  const cached = cache.get(comp.id);
  if (cached) return cached;

  const existing = await prisma.competition.findUnique({
    where: { externalId: comp.id },
    select: { id: true },
  });

  if (existing) {
    await prisma.competition.update({
      where: { id: existing.id },
      data: {
        nameAr: toArabicName(comp.name),
        nameEn: comp.name,
        country: comp.area?.name || null,
        logoUrl: comp.emblem || null,
      },
    });
    cache.set(comp.id, existing.id);
    return existing.id;
  }

  const created = await prisma.competition.create({
    data: {
      externalId: comp.id,
      nameAr: toArabicName(comp.name),
      nameEn: comp.name,
      country: comp.area?.name || null,
      logoUrl: comp.emblem || null,
    },
    select: { id: true },
  });
  cache.set(comp.id, created.id);
  return created.id;
}

async function upsertTeam(team: ApiTeam, cache: Map<number, string>) {
  const cached = cache.get(team.id);
  if (cached) return cached;

  const existing = await prisma.team.findUnique({
    where: { externalId: team.id },
    select: { id: true },
  });

  if (existing) {
    await prisma.team.update({
      where: { id: existing.id },
      data: {
        nameAr: toArabicName(team.name),
        nameEn: team.name,
        shortName: team.shortName || team.tla || null,
        logoUrl: team.crest || null,
      },
    });
    cache.set(team.id, existing.id);
    return existing.id;
  }

  const created = await prisma.team.create({
    data: {
      externalId: team.id,
      nameAr: toArabicName(team.name),
      nameEn: team.name,
      shortName: team.shortName || team.tla || null,
      logoUrl: team.crest || null,
    },
    select: { id: true },
  });
  cache.set(team.id, created.id);
  return created.id;
}

async function upsertMatch(match: ApiMatch, ids: { homeTeamId: string; awayTeamId: string; competitionId: string }) {
  const existing = await prisma.match.findUnique({
    where: { externalId: match.id },
    select: { id: true },
  });

  const data = {
    slug: matchSlug(match.id),
    startsAt: new Date(match.utcDate),
    status: mapStatus(match.status),
    homeTeamId: ids.homeTeamId,
    awayTeamId: ids.awayTeamId,
    competitionId: ids.competitionId,
  };

  if (existing) {
    await prisma.match.update({
      where: { id: existing.id },
      data,
    });
    return "updated";
  }

  await prisma.match.create({
    data: {
      externalId: match.id,
      ...data,
    },
  });
  return "created";
}

async function main() {
  const matches = await fetchMatches();

  const competitionCache = new Map<number, string>();
  const teamCache = new Map<number, string>();
  let created = 0;
  let updated = 0;

  for (const m of matches) {
    const competitionId = await upsertCompetition(m.competition, competitionCache);
    const homeTeamId = await upsertTeam(m.homeTeam, teamCache);
    const awayTeamId = await upsertTeam(m.awayTeam, teamCache);
    const result = await upsertMatch(m, { competitionId, homeTeamId, awayTeamId });
    if (result === "created") created += 1;
    else updated += 1;
  }

  console.log(
    `Sync done. competitions=${competitionCache.size}, teams=${teamCache.size}, matches=${matches.length}, created=${created}, updated=${updated}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


