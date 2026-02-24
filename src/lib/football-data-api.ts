import { MatchStatus } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

export type ApiTodayMatch = {
  externalId: number;
  slug: string;
  startsAt: string;
  status: string;
  apiSource: "rapidapi" | "football-data";
  homeTeam: {
    nameEn: string;
    nameAr: string;
    id?: number | null;
    logoUrl?: string | null;
    winner?: boolean | null;
  };
  awayTeam: {
    nameEn: string;
    nameAr: string;
    id?: number | null;
    logoUrl?: string | null;
    winner?: boolean | null;
  };
  competition: {
    nameEn: string;
    nameAr: string;
    id?: number | null;
    logoUrl?: string | null;
  };
  referee?: string | null;
  timezone?: string | null;
  venue?: {
    id?: number | null;
    name?: string | null;
    city?: string | null;
  } | null;
  score?: {
    home?: number | null;
    away?: number | null;
  } | null;
  periods?: {
    first?: number | null;
    second?: number | null;
  } | null;
  elapsed?: number | null;
  leagueRound?: string | null;
  leagueCountry?: string | null;
  shortStatus?: string | null;
  longStatus?: string | null;
};

type ApiTeam = {
  id: number;
  name: string;
  crest?: string | null;
};

type ApiCompetition = {
  id: number;
  name: string;
  emblem?: string | null;
};

type ApiReferee = {
  name?: string | null;
};

type ApiMatch = {
  id: number;
  status: string;
  utcDate: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  competition: ApiCompetition;
  referees?: ApiReferee[] | null;
};

type MatchesResponse = {
  matches?: ApiMatch[];
};

type RapidApiListResponse = {
  response?: RapidApiFixture[];
};

type RapidApiDetailResponse = {
  response?: RapidApiFixture[];
};

type RapidApiFixture = {
  fixture?: {
    id?: number;
    timezone?: string | null;
    date?: string;
    timestamp?: number | null;
    status?: {
      long?: string | null;
      short?: string | null;
      elapsed?: number | null;
    } | null;
    venue?: {
      id?: number | null;
      name?: string | null;
      city?: string | null;
    } | null;
    referee?: string | null;
    periods?: {
      first?: number | null;
      second?: number | null;
    } | null;
  } | null;
  league?: {
    id?: number | null;
    name?: string;
    logo?: string | null;
    country?: string | null;
    round?: string | null;
  } | null;
  teams?: {
    home?: {
      id?: number | null;
      name?: string;
      logo?: string | null;
      winner?: boolean | null;
    } | null;
    away?: {
      id?: number | null;
      name?: string;
      logo?: string | null;
      winner?: boolean | null;
    } | null;
  } | null;
  goals?: {
    home?: number | null;
    away?: number | null;
  } | null;
};

type TodayMatchesCache = {
  ts: number;
  date: string;
  matches: ApiTodayMatch[];
};

const TODAY_MATCHES_CACHE_TTL_MS = 5 * 60_000;
const TODAY_MATCHES_DB_SYNC_TTL_MS = 5 * 60_000;

const competitionArMap: Record<string, string> = {
  "premier league": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a \u0627\u0644\u0645\u0645\u062a\u0627\u0632",
  "la liga": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a",
  "primera division": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a",
  "bundesliga": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a",
  "ligue 1": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0641\u0631\u0646\u0633\u064a",
  "serie a": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0625\u064a\u0637\u0627\u0644\u064a",
  "eredivisie": "\u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a",
  "uefa champions league": "\u062f\u0648\u0631\u064a \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627",
};

const teamArMap: Record<string, string> = {
  "real madrid": "\u0631\u064a\u0627\u0644 \u0645\u062f\u0631\u064a\u062f",
  "barcelona": "\u0628\u0631\u0634\u0644\u0648\u0646\u0629",
  "fc barcelona": "\u0628\u0631\u0634\u0644\u0648\u0646\u0629",
  "manchester city": "\u0645\u0627\u0646\u0634\u0633\u062a\u0631 \u0633\u064a\u062a\u064a",
  "manchester united": "\u0645\u0627\u0646\u0634\u0633\u062a\u0631 \u064a\u0648\u0646\u0627\u064a\u062a\u062f",
  liverpool: "\u0644\u064a\u0641\u0631\u0628\u0648\u0644",
  arsenal: "\u0623\u0631\u0633\u0646\u0627\u0644",
  chelsea: "\u062a\u0634\u064a\u0644\u0633\u064a",
  "tottenham hotspur": "\u062a\u0648\u062a\u0646\u0647\u0627\u0645",
  juventus: "\u064a\u0648\u0641\u0646\u062a\u0648\u0633",
  "ac milan": "\u0645\u064a\u0644\u0627\u0646",
  inter: "\u0625\u0646\u062a\u0631",
  napoli: "\u0646\u0627\u0628\u0648\u0644\u064a",
  "paris saint germain": "\u0628\u0627\u0631\u064a\u0633 \u0633\u0627\u0646 \u062c\u064a\u0631\u0645\u0627\u0646",
  "paris saint-germain": "\u0628\u0627\u0631\u064a\u0633 \u0633\u0627\u0646 \u062c\u064a\u0631\u0645\u0627\u0646",
  "atletico madrid": "\u0623\u062a\u0644\u062a\u064a\u0643\u0648 \u0645\u062f\u0631\u064a\u062f",
};

function normalizeKey(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function toArabicName(name: string, type: "team" | "competition") {
  const key = normalizeKey(name);
  if (type === "team") return teamArMap[key] || name;
  return competitionArMap[key] || name;
}

function apiBase() {
  return (process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4").replace(/\/+$/, "");
}

function apiKey() {
  return process.env.FOOTBALL_DATA_API_KEY?.trim() || "";
}

function rapidApiKey() {
  return process.env.FOOTBALL_RAPIDAPI_KEY?.trim() || process.env.FOOTBALL_DATA_API_KEY?.trim() || "";
}

function rapidApiHost() {
  return process.env.FOOTBALL_RAPIDAPI_HOST?.trim() || "api-football-v1.p.rapidapi.com";
}

function rapidApiBase() {
  return (process.env.FOOTBALL_RAPIDAPI_BASE_URL || "https://api-football-v1.p.rapidapi.com/v3").replace(/\/+$/, "");
}

function toDateOnlyLocal(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysLocal(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function mapStatusToDb(status: string): MatchStatus {
  const s = status.toUpperCase();
  if (["LIVE", "IN_PLAY", "PAUSED", "HT", "1H", "2H", "ET", "P"].includes(s)) return MatchStatus.LIVE;
  if (["FINISHED", "FT", "AET", "PEN"].includes(s)) return MatchStatus.FINISHED;
  if (["POSTPONED", "SUSPENDED", "CANCELLED", "PST", "CANC", "SUSP", "ABD", "AWD", "WO", "INT"].includes(s)) {
    return MatchStatus.POSTPONED;
  }
  return MatchStatus.SCHEDULED;
}

async function upsertCompetitionFromTodayMatch(input: ApiTodayMatch["competition"], cache: Map<string, string>) {
  const key = input.id != null ? `ext:${input.id}` : `name:${input.nameEn}`;
  const cached = cache.get(key);
  if (cached) return cached;

  if (input.id != null) {
    const row = await prisma.competition.upsert({
      where: { externalId: input.id },
      update: {
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
      },
      create: {
        externalId: input.id,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
      },
      select: { id: true },
    });
    cache.set(key, row.id);
    return row.id;
  }

  const existing = await prisma.competition.findFirst({
    where: { nameEn: input.nameEn },
    select: { id: true },
  });
  if (existing) {
    await prisma.competition.update({
      where: { id: existing.id },
      data: {
        nameAr: input.nameAr,
        logoUrl: input.logoUrl || null,
      },
    });
    cache.set(key, existing.id);
    return existing.id;
  }

  const created = await prisma.competition.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      logoUrl: input.logoUrl || null,
    },
    select: { id: true },
  });
  cache.set(key, created.id);
  return created.id;
}

async function upsertTeamFromTodayMatch(
  input: ApiTodayMatch["homeTeam"] | ApiTodayMatch["awayTeam"],
  cache: Map<string, string>,
) {
  const key = input.id != null ? `ext:${input.id}` : `name:${input.nameEn}`;
  const cached = cache.get(key);
  if (cached) return cached;

  if (input.id != null) {
    const row = await prisma.team.upsert({
      where: { externalId: input.id },
      update: {
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
      },
      create: {
        externalId: input.id,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
      },
      select: { id: true },
    });
    cache.set(key, row.id);
    return row.id;
  }

  const existing = await prisma.team.findFirst({
    where: { nameEn: input.nameEn },
    select: { id: true },
  });
  if (existing) {
    await prisma.team.update({
      where: { id: existing.id },
      data: {
        nameAr: input.nameAr,
        logoUrl: input.logoUrl || null,
      },
    });
    cache.set(key, existing.id);
    return existing.id;
  }

  const created = await prisma.team.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      logoUrl: input.logoUrl || null,
    },
    select: { id: true },
  });
  cache.set(key, created.id);
  return created.id;
}

async function syncTodayMatchesToDb(matches: ApiTodayMatch[]) {
  if (matches.length === 0) return;

  const competitionCache = new Map<string, string>();
  const teamCache = new Map<string, string>();

  for (const match of matches) {
    const competitionId = await upsertCompetitionFromTodayMatch(match.competition, competitionCache);
    const homeTeamId = await upsertTeamFromTodayMatch(match.homeTeam, teamCache);
    const awayTeamId = await upsertTeamFromTodayMatch(match.awayTeam, teamCache);

    await prisma.match.upsert({
      where: { externalId: match.externalId },
      update: {
        slug: match.slug,
        startsAt: new Date(match.startsAt),
        status: mapStatusToDb(match.status),
        homeTeamId,
        awayTeamId,
        competitionId,
      },
      create: {
        externalId: match.externalId,
        slug: match.slug,
        startsAt: new Date(match.startsAt),
        status: mapStatusToDb(match.status),
        homeTeamId,
        awayTeamId,
        competitionId,
      },
    });
  }
}

async function syncTodayMatchesToDbEvery5Min(input: { matches: ApiTodayMatch[]; date: string }) {
  const g = globalThis as typeof globalThis & {
    __todayMatchesDbSync?: {
      date: string;
      ts: number;
      promise?: Promise<void>;
    };
  };

  const nowMs = Date.now();
  const state = g.__todayMatchesDbSync;
  if (state?.promise) return state.promise;
  if (state && state.date === input.date && nowMs - state.ts < TODAY_MATCHES_DB_SYNC_TTL_MS) return;

  const promise = syncTodayMatchesToDb(input.matches);
  g.__todayMatchesDbSync = { date: input.date, ts: state?.ts || 0, promise };

  try {
    await promise;
    g.__todayMatchesDbSync = { date: input.date, ts: Date.now() };
  } catch (err) {
    g.__todayMatchesDbSync = { date: input.date, ts: state?.ts || 0 };
    throw err;
  }
}

function mapApiMatch(m: ApiMatch): ApiTodayMatch {
  return {
    externalId: m.id,
    slug: `fd-${m.id}`,
    startsAt: m.utcDate,
    status: m.status,
    apiSource: "football-data",
    homeTeam: {
      nameEn: m.homeTeam.name,
      nameAr: toArabicName(m.homeTeam.name, "team"),
      id: m.homeTeam.id,
      logoUrl: m.homeTeam.crest || null,
      winner: null,
    },
    awayTeam: {
      nameEn: m.awayTeam.name,
      nameAr: toArabicName(m.awayTeam.name, "team"),
      id: m.awayTeam.id,
      logoUrl: m.awayTeam.crest || null,
      winner: null,
    },
    competition: {
      nameEn: m.competition.name,
      nameAr: toArabicName(m.competition.name, "competition"),
      id: m.competition.id,
      logoUrl: m.competition.emblem || null,
    },
    referee: m.referees?.[0]?.name || null,
    timezone: "UTC",
    venue: null,
    score: null,
    periods: null,
    elapsed: null,
    leagueRound: null,
    leagueCountry: null,
    shortStatus: null,
    longStatus: null,
  };
}

function normalizeRapidStatus(shortStatus?: string | null, longStatus?: string | null) {
  const s = (shortStatus || "").toUpperCase();
  if (["NS", "TBD"].includes(s)) return "TIMED";
  if (["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(s)) return "IN_PLAY";
  if (["FT", "AET", "PEN"].includes(s)) return "FINISHED";
  if (["PST", "CANC", "ABD", "AWD", "WO", "SUSP", "INT"].includes(s)) return "POSTPONED";
  return (longStatus || shortStatus || "TIMED").toUpperCase();
}

function mapRapidFixtureMatch(f: RapidApiFixture): ApiTodayMatch | null {
  const fixtureId = f.fixture?.id;
  const date = f.fixture?.date;
  const home = f.teams?.home;
  const away = f.teams?.away;
  const league = f.league;
  if (!fixtureId || !date || !home?.name || !away?.name || !league?.name) return null;
  return {
    externalId: fixtureId,
    slug: `fd-${fixtureId}`,
    startsAt: date,
    status: normalizeRapidStatus(f.fixture?.status?.short, f.fixture?.status?.long),
    apiSource: "rapidapi",
    homeTeam: {
      nameEn: home.name,
      nameAr: toArabicName(home.name, "team"),
      id: home.id ?? null,
      logoUrl: home.logo || null,
      winner: home.winner ?? null,
    },
    awayTeam: {
      nameEn: away.name,
      nameAr: toArabicName(away.name, "team"),
      id: away.id ?? null,
      logoUrl: away.logo || null,
      winner: away.winner ?? null,
    },
    competition: {
      nameEn: league.name,
      nameAr: toArabicName(league.name, "competition"),
      id: league.id ?? null,
      logoUrl: league.logo || null,
    },
    referee: f.fixture?.referee || null,
    timezone: f.fixture?.timezone || null,
    venue: f.fixture?.venue
      ? {
          id: f.fixture.venue.id ?? null,
          name: f.fixture.venue.name ?? null,
          city: f.fixture.venue.city ?? null,
        }
      : null,
    score: {
      home: f.goals?.home ?? null,
      away: f.goals?.away ?? null,
    },
    periods: f.fixture?.periods
      ? {
          first: f.fixture.periods.first ?? null,
          second: f.fixture.periods.second ?? null,
        }
      : null,
    elapsed: f.fixture?.status?.elapsed ?? null,
    leagueRound: league.round || null,
    leagueCountry: league.country || null,
    shortStatus: f.fixture?.status?.short || null,
    longStatus: f.fixture?.status?.long || null,
  };
}

async function fetchWithTimeout(url: string) {
  const key = apiKey();
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": key },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRapidWithTimeout(url: string) {
  const key = rapidApiKey();
  const host = rapidApiHost();
  if (!key || !host) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": host,
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchTodayMatchesFromApi(): Promise<ApiTodayMatch[]> {
  const now = new Date();
  const today = toDateOnlyLocal(now);
  const dateFrom = toDateOnlyLocal(addDaysLocal(now, -1));
  const dateTo = toDateOnlyLocal(addDaysLocal(now, 1));
  const g = globalThis as typeof globalThis & { __todayMatchesCache?: TodayMatchesCache };
  const cache = g.__todayMatchesCache;
  const nowMs = Date.now();
  if (cache && cache.date === today && nowMs - cache.ts < TODAY_MATCHES_CACHE_TTL_MS) {
    return cache.matches;
  }

  const rapidUrl = new URL(`${rapidApiBase()}/fixtures`);
  rapidUrl.searchParams.set("date", today);
  rapidUrl.searchParams.set("timezone", "UTC");
  const rapidRes = await fetchRapidWithTimeout(rapidUrl.toString());
  if (rapidRes) {
    try {
      const json = (await rapidRes.json()) as RapidApiListResponse;
      const rapidMatches = (json.response || [])
        .map(mapRapidFixtureMatch)
        .filter((m): m is ApiTodayMatch => Boolean(m))
        .filter((m) => toDateOnlyLocal(new Date(m.startsAt)) === today);
      g.__todayMatchesCache = { ts: nowMs, date: today, matches: rapidMatches };
      await syncTodayMatchesToDbEvery5Min({ matches: rapidMatches, date: today });
      return rapidMatches;
    } catch {
      // fallback below
    }
  }

  const url = new URL(`${apiBase()}/matches`);
  url.searchParams.set("dateFrom", dateFrom);
  url.searchParams.set("dateTo", dateTo);
  const res = await fetchWithTimeout(url.toString());
  if (!res) {
    if (cache && cache.date === today) return cache.matches;
    return [];
  }

  try {
    const json = (await res.json()) as MatchesResponse;
    const filtered = (json.matches || [])
      .map(mapApiMatch)
      .filter((m) => toDateOnlyLocal(new Date(m.startsAt)) === today);
    g.__todayMatchesCache = { ts: nowMs, date: today, matches: filtered };
    await syncTodayMatchesToDbEvery5Min({ matches: filtered, date: today });
    return filtered;
  } catch {
    if (cache && cache.date === today) return cache.matches;
    return [];
  }
}

export async function fetchMatchByExternalId(externalId: number): Promise<ApiTodayMatch | null> {
  const rapidUrl = new URL(`${rapidApiBase()}/fixtures`);
  rapidUrl.searchParams.set("id", String(externalId));
  const rapidRes = await fetchRapidWithTimeout(rapidUrl.toString());
  if (rapidRes) {
    try {
      const json = (await rapidRes.json()) as RapidApiDetailResponse;
      const mapped = mapRapidFixtureMatch(json.response?.[0] || {});
      if (mapped) return mapped;
    } catch {
      // fallback below
    }
  }

  const res = await fetchWithTimeout(`${apiBase()}/matches/${externalId}`);
  if (!res) return null;
  try {
    const json = (await res.json()) as { match?: ApiMatch };
    if (!json.match) return null;
    return mapApiMatch(json.match);
  } catch {
    return null;
  }
}
