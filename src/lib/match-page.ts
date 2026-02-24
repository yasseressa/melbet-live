import { prisma } from "@/src/lib/prisma";
import { Locale } from "@/src/lib/i18n";
import { fetchMatchByExternalId } from "@/src/lib/football-data-api";

export function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export function statusLabel(status: string, locale: Locale) {
  const s = status.toUpperCase();
  if (locale !== "ar") {
    if (s === "TIMED") return "SCHEDULED";
    if (s === "IN_PLAY") return "LIVE";
    return s;
  }
  if (s === "SCHEDULED" || s === "TIMED") return "لم تبدأ بعد";
  if (s === "LIVE" || s === "IN_PLAY") return "مباشر";
  if (s === "FINISHED") return "انتهت";
  if (s === "POSTPONED" || s === "SUSPENDED" || s === "CANCELLED") return "مؤجلة";
  return status;
}

export async function resolveMatch(slug: string) {
  const db = await prisma.match.findUnique({
    where: { slug },
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
      streams: { orderBy: { createdAt: "asc" } },
    },
  });
  if (db) {
    return {
      slug: db.slug,
      startsAt: db.startsAt.toISOString(),
      status: db.status,
      apiSource: "db",
      homeTeam: {
        nameAr: db.homeTeam.nameAr,
        nameEn: db.homeTeam.nameEn ?? db.homeTeam.nameAr,
        id: null,
        logoUrl: db.homeTeam.logoUrl,
        winner: null,
      },
      awayTeam: {
        nameAr: db.awayTeam.nameAr,
        nameEn: db.awayTeam.nameEn ?? db.awayTeam.nameAr,
        id: null,
        logoUrl: db.awayTeam.logoUrl,
        winner: null,
      },
      competition: {
        nameAr: db.competition.nameAr,
        nameEn: db.competition.nameEn ?? db.competition.nameAr,
        id: null,
        logoUrl: db.competition.logoUrl,
      },
      referee: null,
      timezone: null,
      venue: null,
      score: null,
      periods: null,
      elapsed: null,
      leagueRound: null,
      leagueCountry: null,
      shortStatus: null,
      longStatus: null,
      fallbackStream: db.streams.find((s) => s.enabled && s.isPrimary)?.playbackUrl || null,
      fallbackProvider: db.streams.find((s) => s.enabled && s.isPrimary)?.provider || null,
    };
  }

  const m = /^fd-(\d+)$/.exec(slug);
  if (!m) return null;
  const externalId = Number(m[1]);
  if (!Number.isFinite(externalId)) return null;

  const api = await fetchMatchByExternalId(externalId);
  if (!api) return null;
  return {
    slug: api.slug,
    startsAt: api.startsAt,
    status: api.status,
    apiSource: api.apiSource,
    homeTeam: api.homeTeam,
    awayTeam: api.awayTeam,
    competition: api.competition,
    referee: api.referee || null,
    timezone: api.timezone || null,
    venue: api.venue || null,
    score: api.score || null,
    periods: api.periods || null,
    elapsed: api.elapsed ?? null,
    leagueRound: api.leagueRound || null,
    leagueCountry: api.leagueCountry || null,
    shortStatus: api.shortStatus || null,
    longStatus: api.longStatus || null,
    fallbackStream: null,
    fallbackProvider: null,
  };
}
