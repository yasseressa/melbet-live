import { isLocale, Locale } from "@/src/lib/i18n";
import { Card, CardHeader, Container } from "@/src/components/ui";
import { parseM3u } from "@/src/lib/m3u";
import M3uTestPlayer from "@/src/components/M3uTestPlayer";
import { readFile } from "node:fs/promises";

function getServerBase() {
  return (
    process.env.M3U_TEST_SERVER_BASE?.trim() ||
    process.env.XTREAM_HOST?.trim() ||
    "http://free.raskiptv.com:8080"
  ).replace(/\/+$/, "");
}

function getLocalFilePath() {
  const p = process.env.M3U_TEST_LOCAL_FILE?.trim();
  return p || null;
}

function getPlaylistUrl(base: string) {
  const direct = process.env.M3U_TEST_URL?.trim();
  if (direct) {
    try {
      const u = new URL(direct);
      if (u.searchParams.get("output")?.toLowerCase() === "ts") {
        u.searchParams.set("output", "m3u8");
      }
      if (!u.searchParams.get("type")) {
        u.searchParams.set("type", "m3u_plus");
      }
      return u.toString();
    } catch {
      return direct;
    }
  }

  const user = process.env.XTREAM_USERNAME?.trim();
  const pass = process.env.XTREAM_PASSWORD?.trim();
  if (user && pass) {
    return `${base}/get.php?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}&type=m3u_plus&output=m3u8`;
  }
  return null;
}

export default async function M3uTestPage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const base = getServerBase();

  const localFilePath = getLocalFilePath();
  const playlistUrl = getPlaylistUrl(base);
  let channels = [] as ReturnType<typeof parseM3u>;

  if (localFilePath) {
    try {
      const full = await readFile(localFilePath, "utf8");
      channels = parseM3u(full).slice(0, 300);
    } catch {
      channels = [];
    }
  } else if (playlistUrl) {
    try {
      const full = await fetch(playlistUrl, { cache: "no-store" }).then((r) => r.text());
      channels = parseM3u(full).slice(0, 300);
    } catch {
      channels = [];
    }
  }

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={locale === "ar" ? "مشغل اختبار M3U" : "M3U Test Player"}
              subtitle={locale === "ar" ? `عدد القنوات: ${channels.length}` : `Channels found: ${channels.length}`}
            />
            <div className="p-4">
              {channels.length === 0 ? (
                <div className="text-sm text-neutral-300">
                  {locale === "ar"
                    ? "لم يتم العثور على قائمة M3U صالحة. أضف M3U_TEST_URL أو بيانات Xtream صحيحة في ملف البيئة."
                    : "No valid M3U playlist found. Set M3U_TEST_URL or valid Xtream credentials in your env file."}
                </div>
              ) : (
                <M3uTestPlayer channels={channels} locale={locale} />
              )}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
