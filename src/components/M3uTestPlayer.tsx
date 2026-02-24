"use client";

import { useMemo, useState } from "react";
import HlsPlayer from "@/src/components/HlsPlayer";
import DashPlayer from "@/src/components/DashPlayer";
import type { M3uChannel } from "@/src/lib/m3u";

function splitUrlAndOptions(rawUrl: string) {
  const [url, opts] = rawUrl.split("|", 2);
  const options: Record<string, string> = {};
  if (opts) {
    for (const part of opts.split("&")) {
      const [k, v = ""] = part.split("=", 2);
      if (!k) continue;
      options[k.trim().toLowerCase()] = decodeURIComponent(v.trim());
    }
  }
  return { url, options };
}

function parseClearKey(value: string | undefined) {
  if (!value) return null;
  const pairs = value.split(",");
  const keys: Record<string, string> = {};
  for (const pair of pairs) {
    const [kid, key] = pair.split(":", 2);
    if (kid && key) keys[kid.trim()] = key.trim();
  }
  return Object.keys(keys).length > 0 ? keys : null;
}

export default function M3uTestPlayer({
  channels,
  locale,
}: {
  channels: M3uChannel[];
  locale: "ar" | "en";
}) {
  const [selectedUrl, setSelectedUrl] = useState(channels[0]?.url || "");
  const selected = useMemo(() => channels.find((x) => x.url === selectedUrl) || null, [channels, selectedUrl]);
  const parsed = useMemo(() => splitUrlAndOptions(selectedUrl), [selectedUrl]);
  const baseUrl = parsed.url;
  const hlsCandidateUrl = useMemo(() => {
    if (/\.m3u8($|\?)/i.test(baseUrl)) return baseUrl;
    if (/\.ts($|\?)/i.test(baseUrl)) {
      return baseUrl.replace(/\.ts(\?|$)/i, ".m3u8$1");
    }
    return baseUrl;
  }, [baseUrl]);
  const isHls = /\.m3u8($|\?)/i.test(hlsCandidateUrl);
  const isDash = /\.mpd($|\?)/i.test(baseUrl) || /dash|mpd/i.test(parsed.options.type || "");
  const isConverted = hlsCandidateUrl !== baseUrl;
  const clearKeys = useMemo(() => parseClearKey(parsed.options.license_key), [parsed.options.license_key]);
  const isClearKey = /clearkey/i.test(parsed.options.license_type || "");

  if (channels.length === 0) return null;

  return (
    <div className="space-y-4">
      <label className="block text-sm text-neutral-300">
        {locale === "ar" ? "اختر قناة" : "Pick a channel"}
      </label>
      <select
        value={selectedUrl}
        onChange={(e) => setSelectedUrl(e.target.value)}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
      >
        {channels.map((c) => (
          <option key={c.url} value={c.url}>
            {c.name}{c.group ? ` (${c.group})` : ""}
          </option>
        ))}
      </select>

      {selected ? (
        <div className="text-xs text-neutral-400 break-all">
          {locale === "ar" ? "رابط القناة:" : "Channel URL:"} {selected.url}
        </div>
      ) : null}
      {isConverted ? (
        <div className="text-xs text-neutral-500 break-all">
          {/*locale === "ar" ? "رابط HLS المجرّب:" : "HLS URL used for playback:"*/} {hlsCandidateUrl}
        </div>
      ) : null}

      {selectedUrl ? (
        isDash ? (
          <div className="space-y-2">
            <DashPlayer src={baseUrl} clearKeys={isClearKey ? clearKeys || undefined : undefined} autoPlay={false} />
            <div className="text-xs text-neutral-500">
              {/*locale === "ar"
                ? "تم الكشف عن رابط DASH (.mpd) وتم تشغيله بمشغل DASH."
                : "Detected a DASH (.mpd) stream and played it with the DASH player."*/}
            </div>
          </div>
        ) : isHls ? (
          <HlsPlayer src={hlsCandidateUrl} autoPlay={false} />
        ) : (
          <div className="space-y-2">
            <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black">
              <video
                controls
                playsInline
                className="w-full h-auto max-h-[70vh] bg-black"
                src={baseUrl}
              />
            </div>
            {/*
            <div className="text-xs text-neutral-500">
              {locale === "ar"
                ? "هذا الرابط ليس HLS (.m3u8)، يتم تشغيله بالمشغل الأصلي للمتصفح."
                : "This URL is not HLS (.m3u8), so it is played with the browser native player."}
            </div>
            */}
          </div>
        )
      ) : null}
    </div>
  );
}
