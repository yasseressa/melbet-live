import { isLocale, Locale, pickLang } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { baseUrl, resolveMatch, statusLabel } from "@/src/lib/match-page";
import { findXtreamStreamForMatch } from "@/src/lib/xtream";
import { fetchMatchNews } from "@/src/lib/match-news";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const match = await resolveMatch(params.slug);
  if (!match) {
    const title = locale === "ar" ? "المباراة غير موجودة" : "Match not found";
    return { title, robots: { index: false, follow: false } };
  }

  const home = pickLang(match.homeTeam.nameAr, match.homeTeam.nameEn, locale);
  const away = pickLang(match.awayTeam.nameAr, match.awayTeam.nameEn, locale);
  const comp = pickLang(match.competition.nameAr, match.competition.nameEn, locale);
  const title = locale === "ar"
    ? `مشاهدة ${home} ضد ${away} | ${comp}`
    : `Watch ${home} vs ${away} | ${comp}`;
  const description = locale === "ar"
    ? `رابط مشاهدة مباراة ${home} ضد ${away} وأخبار الفريقين.`
    : `Watch link and news for ${home} vs ${away}.`;
  const url = `${baseUrl()}/${locale}/match/${match.slug}/watch`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${baseUrl()}/ar/match/${match.slug}/watch`,
        en: `${baseUrl()}/en/match/${match.slug}/watch`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "video.other",
      siteName: "Melbet-Live",
      locale: locale === "ar" ? "ar_AR" : "en_US",
    },
  };
}

export default async function MatchWatchPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const match = await resolveMatch(params.slug);

  if (!match) {
    return (
      <main className="py-10">
        <Container>
          <Card>
            <CardHeader title={locale === "ar" ? "المباراة غير موجودة" : "Match not found"} />
            <div className="p-4"><Button href={`/${locale}`} variant="primary">{locale === "ar" ? "العودة" : "Back"}</Button></div>
          </Card>
        </Container>
      </main>
    );
  }

  const xtream = await findXtreamStreamForMatch({
    homeTeam: match.homeTeam.nameEn,
    awayTeam: match.awayTeam.nameEn,
    competition: match.competition.nameEn,
  });
  const playbackUrl = xtream?.playbackUrl ?? match.fallbackStream;
  const sourceLabel = xtream ? `Xtream (${xtream.name})` : (match.fallbackProvider || null);

  const news = await fetchMatchNews({
    homeTeam: match.homeTeam.nameEn,
    awayTeam: match.awayTeam.nameEn,
    locale,
  });

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm text-neutral-400">{pickLang(match.competition.nameAr, match.competition.nameEn, locale)}</div>
              <h1 className="text-2xl font-bold mt-1">
                {pickLang(match.homeTeam.nameAr, match.homeTeam.nameEn, locale)} <span className="text-neutral-500">{locale === "ar" ? "ضد" : "vs"}</span>{" "}
                {pickLang(match.awayTeam.nameAr, match.awayTeam.nameEn, locale)}
              </h1>
              <div className="mt-2 text-sm text-neutral-300">
                {new Date(match.startsAt).toLocaleString(locale === "ar" ? "ar" : "en")} | {statusLabel(match.status, locale)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button href={`/${locale}/match/${match.slug}`} variant="primary">{locale === "ar" ? "تفاصيل المباراة" : "Match details"}</Button>
              <Button href={`/${locale}`} variant="primary">{locale === "ar" ? "الرئيسية" : "Home"}</Button>
            </div>
          </div>

          <Card>
            <CardHeader
              title={locale === "ar" ? "مشغل البث" : "Player"}
              subtitle={locale === "ar" ? "رابط مشاهدة المباراة" : "Watch link for this match"}
            />
            <div className="p-4 space-y-4">
              {!playbackUrl ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6 text-neutral-300">
                  <div className="font-semibold">{locale === "ar" ? "لا يوجد رابط بث متاح حالياً." : "No watch stream available right now."}</div>
                </div>
              ) : (
                <iframe
                  src={playbackUrl}
                  title={locale === "ar" ? "بث المباراة" : "Match stream"}
                  className="h-[420px] w-full rounded-2xl border border-neutral-800 bg-neutral-950/40"
                  allowFullScreen
                />
              )}

              {sourceLabel ? (
                <div className="text-xs text-neutral-400">
                  {locale === "ar" ? "مصدر البث:" : "Stream source:"} {sourceLabel}
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={locale === "ar" ? "أخبار عن المباراة" : "Match News"}
              subtitle={locale === "ar" ? "أحدث أخبار الفريقين" : "Latest news related to both teams"}
            />
            <div className="p-4 space-y-3">
              {news.length === 0 ? (
                <div className="text-sm text-neutral-400">
                  {locale === "ar" ? "لا توجد أخبار متاحة حالياً." : "No match news available right now."}
                </div>
              ) : news.map((n) => (
                <a
                  key={`${n.url}-${n.publishedAt}`}
                  href={n.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="block rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 hover:bg-neutral-900 transition"
                >
                  <div className="font-semibold">{n.title}</div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {new Date(n.publishedAt).toLocaleString(locale === "ar" ? "ar" : "en")} | {n.source}
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
