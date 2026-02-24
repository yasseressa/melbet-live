export type M3uChannel = {
  name: string;
  logo?: string | null;
  group?: string | null;
  url: string;
};

function parseExtInf(line: string) {
  const tvgName = /tvg-name="([^"]*)"/i.exec(line)?.[1]?.trim();
  const tvgLogo = /tvg-logo="([^"]*)"/i.exec(line)?.[1]?.trim();
  const groupTitle = /group-title="([^"]*)"/i.exec(line)?.[1]?.trim();
  const tailName = line.includes(",") ? line.split(",").slice(1).join(",").trim() : "";

  const name = tvgName || tailName || "Unknown Channel";
  return {
    name,
    logo: tvgLogo || null,
    group: groupTitle || null,
  };
}

export function parseM3u(text: string): M3uChannel[] {
  const lines = text.replace(/\r/g, "").split("\n").map((x) => x.trim());
  const out: M3uChannel[] = [];

  let pending: { name: string; logo?: string | null; group?: string | null } | null = null;
  let pendingHlsVariantName: string | null = null;
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      pending = parseExtInf(line);
      continue;
    }
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      const resolution = /RESOLUTION=([^,]+)/i.exec(line)?.[1]?.trim();
      const bandwidth = /BANDWIDTH=([^,]+)/i.exec(line)?.[1]?.trim();
      pendingHlsVariantName = resolution
        ? `HLS ${resolution}`
        : (bandwidth ? `HLS ${bandwidth}` : "HLS Variant");
      continue;
    }
    if (line.startsWith("#")) continue;
    if (!/^https?:\/\//i.test(line)) continue;

    out.push({
      name: pending?.name || pendingHlsVariantName || "Unknown Channel",
      logo: pending?.logo || null,
      group: pending?.group || null,
      url: line,
    });
    pending = null;
    pendingHlsVariantName = null;
  }

  return out;
}
