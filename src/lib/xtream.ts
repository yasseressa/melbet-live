type XtreamLiveStream = {
  stream_id: number;
  name?: string | null;
  stream_icon?: string | null;
};

type XtreamConfig = {
  host: string;
  username: string;
  password: string;
  output: "m3u8" | "ts";
};

type XtreamCache = {
  ts: number;
  streams: XtreamLiveStream[];
};

const XTREAM_CACHE_TTL_MS = 60_000;

function getCacheKey(cfg: XtreamConfig) {
  return `${cfg.host}|${cfg.username}|${cfg.output}`;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  const stop = new Set(["fc", "cf", "sc", "club", "the", "de", "of", "and"]);
  return normalize(text)
    .split(" ")
    .filter((x) => x.length > 2 && !stop.has(x));
}

function getConfig(): XtreamConfig | null {
  const host = process.env.XTREAM_HOST?.trim();
  const username = process.env.XTREAM_USERNAME?.trim();
  const password = process.env.XTREAM_PASSWORD?.trim();
  const output = (process.env.XTREAM_OUTPUT?.trim().toLowerCase() || "m3u8") as "m3u8" | "ts";

  if (!host || !username || !password) return null;
  return { host: host.replace(/\/+$/, ""), username, password, output: output === "ts" ? "ts" : "m3u8" };
}

async function fetchLiveStreams(cfg: XtreamConfig): Promise<XtreamLiveStream[]> {
  const url = new URL(`${cfg.host}/player_api.php`);
  url.searchParams.set("username", cfg.username);
  url.searchParams.set("password", cfg.password);
  url.searchParams.set("action", "get_live_streams");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as XtreamLiveStream[] | null;
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function safeFetchLiveStreams(cfg: XtreamConfig): Promise<XtreamLiveStream[]> {
  try {
    const key = getCacheKey(cfg);
    const g = globalThis as typeof globalThis & { __xtreamCache?: Record<string, XtreamCache> };
    const cache = g.__xtreamCache || (g.__xtreamCache = {});
    const hit = cache[key];
    const now = Date.now();
    if (hit && now - hit.ts < XTREAM_CACHE_TTL_MS) return hit.streams;

    const streams = await fetchLiveStreams(cfg);
    cache[key] = { ts: now, streams };
    return streams;
  } catch {
    return [];
  }
}

function scoreStream(
  streamName: string,
  homeTokens: string[],
  awayTokens: string[],
  competitionTokens: string[],
) {
  const hay = normalize(streamName);
  let score = 0;

  const hasHome = homeTokens.some((t) => hay.includes(t));
  const hasAway = awayTokens.some((t) => hay.includes(t));
  if (hasHome) score += 4;
  if (hasAway) score += 4;
  if (hasHome && hasAway) score += 6;

  if (competitionTokens.some((t) => hay.includes(t))) score += 2;
  if (/\blive\b/.test(hay)) score += 1;

  return score;
}

function buildPlaybackUrl(cfg: XtreamConfig, streamId: number) {
  return `${cfg.host}/live/${cfg.username}/${cfg.password}/${streamId}.${cfg.output}`;
}

export type XtreamMatchedStream = {
  playbackUrl: string;
  name: string;
  icon?: string | null;
};

export type XtreamMatchCandidate = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition?: string | null;
};

export async function findXtreamStreamForMatch(input: {
  homeTeam: string;
  awayTeam: string;
  competition?: string | null;
}): Promise<XtreamMatchedStream | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  const streams = await safeFetchLiveStreams(cfg);
  if (streams.length === 0) return null;

  const homeTokens = tokenize(input.homeTeam);
  const awayTokens = tokenize(input.awayTeam);
  const competitionTokens = tokenize(input.competition || "");

  let best: XtreamLiveStream | null = null;
  let bestScore = -1;

  for (const s of streams) {
    const name = s.name || "";
    const score = scoreStream(name, homeTokens, awayTokens, competitionTokens);
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }

  if (!best || !best.stream_id || bestScore < 6) return null;

  return {
    playbackUrl: buildPlaybackUrl(cfg, best.stream_id),
    name: best.name || `Stream ${best.stream_id}`,
    icon: best.stream_icon || null,
  };
}

export async function getXtreamAvailableMatchIds(
  matches: XtreamMatchCandidate[],
): Promise<string[]> {
  const cfg = getConfig();
  if (!cfg || matches.length === 0) return [];

  const streams = await safeFetchLiveStreams(cfg);
  if (streams.length === 0) return [];

  const scored = matches.filter((m) => {
    const homeTokens = tokenize(m.homeTeam);
    const awayTokens = tokenize(m.awayTeam);
    const competitionTokens = tokenize(m.competition || "");

    let bestScore = -1;
    for (const s of streams) {
      const name = s.name || "";
      const score = scoreStream(name, homeTokens, awayTokens, competitionTokens);
      if (score > bestScore) bestScore = score;
    }
    return bestScore >= 6;
  });

  return scored.map((m) => m.id);
}

export async function findXtreamStreamsForMatches(
  matches: XtreamMatchCandidate[],
): Promise<Record<string, XtreamMatchedStream>> {
  const cfg = getConfig();
  if (!cfg || matches.length === 0) return {};

  const streams = await safeFetchLiveStreams(cfg);
  if (streams.length === 0) return {};

  const result: Record<string, XtreamMatchedStream> = {};
  for (const m of matches) {
    const homeTokens = tokenize(m.homeTeam);
    const awayTokens = tokenize(m.awayTeam);
    const competitionTokens = tokenize(m.competition || "");

    let best: XtreamLiveStream | null = null;
    let bestScore = -1;
    for (const s of streams) {
      const name = s.name || "";
      const score = scoreStream(name, homeTokens, awayTokens, competitionTokens);
      if (score > bestScore) {
        best = s;
        bestScore = score;
      }
    }
    if (best && best.stream_id && bestScore >= 6) {
      result[m.id] = {
        playbackUrl: buildPlaybackUrl(cfg, best.stream_id),
        name: best.name || `Stream ${best.stream_id}`,
        icon: best.stream_icon || null,
      };
    }
  }

  return result;
}
