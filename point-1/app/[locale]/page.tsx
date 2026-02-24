import { isLocale, Locale, pickLang } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { buildNewsImageUrl } from "@/src/lib/news-images";
import { fetchTodayMatchesFromApi } from "@/src/lib/football-data-api";
import { findXtreamStreamsForMatches } from "@/src/lib/xtream";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string, locale: Locale) {
  const s = status.toUpperCase();
  if (locale !== "ar") {
    if (s === "TIMED") return "SCHEDULED";
    if (s === "IN_PLAY") return "LIVE";
    return s;
  }
  if (s === "SCHEDULED" || s === "TIMED") return "\u0644\u0645 \u062a\u0628\u062f\u0623 \u0628\u0639\u062f";
  if (s === "LIVE" || s === "IN_PLAY") return "\u0645\u0628\u0627\u0634\u0631";
  if (s === "FINISHED") return "\u0627\u0646\u062a\u0647\u062a";
  if (s === "POSTPONED" || s === "SUSPENDED" || s === "CANCELLED") return "\u0645\u0624\u062c\u0644\u0629";
  return status;
}

function TeamNameWithLogo({
  name,
  logoUrl,
  align = "start",
}: {
  name: string;
  logoUrl?: string | null;
  align?: "start" | "end";
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${align === "end" ? "justify-end" : "justify-start"}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          width={52}
          height={52}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-[52px] w-[52px] rounded-full object-contain bg-white"
        />
      ) : (
        <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-neutral-800 text-base font-semibold text-neutral-200">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-xl font-semibold text-white">{name}</span>
    </span>
  );
}

export default async function Home({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  const [apiMatches, rawNews] = await Promise.all([
    fetchTodayMatchesFromApi(),
    prisma.news.findMany({
      orderBy: { publishedAt: "desc" },
      include: { category: true },
      take: 60,
    }),
  ]);

  const xtreamMap = await findXtreamStreamsForMatches(
    apiMatches.map((m) => ({
      id: String(m.externalId),
      homeTeam: m.homeTeam.nameEn,
      awayTeam: m.awayTeam.nameEn,
      competition: m.competition.nameEn,
    })),
  );
  const matches = apiMatches.map((m) => ({
    ...m,
    streamName: xtreamMap[String(m.externalId)]?.name || null,
  }));

  const preferredSourceLang = locale === "ar" ? "AR" : "EN";
  const news = [
    ...rawNews.filter((item) => item.sourceLang === preferredSourceLang),
    ...rawNews.filter((item) => item.sourceLang !== preferredSourceLang),
  ].slice(0, 9);

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={locale === "ar" ? "\u0645\u0628\u0627\u0631\u064a\u0627\u062a \u0627\u0644\u064a\u0648\u0645" : "Today Matches"}
              subtitle={locale === "ar" ? "\u062c\u062f\u0648\u0644 \u0645\u0628\u0627\u0631\u064a\u0627\u062a \u0627\u0644\u064a\u0648\u0645" : "Today's match schedule"}
            />

            <div id="today" className="p-4 space-y-3">
              {matches.length === 0 ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 text-neutral-400">
                  {locale === "ar" ? "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0628\u0627\u0631\u064a\u0627\u062a \u0627\u0644\u064a\u0648\u0645." : "No matches today."}
                </div>
              ) : matches.map((m) => (
                <div
                  key={m.externalId}
                  className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/70"
                >
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4">
                    <TeamNameWithLogo
                      name={pickLang(m.homeTeam.nameAr, m.homeTeam.nameEn, locale)}
                      logoUrl={m.homeTeam.logoUrl}
                      align="start"
                    />

                    <div className="text-center">
                      <div className="text-2xl font-bold text-melbet-yellow">
                        {new Date(m.startsAt).toLocaleTimeString(locale === "ar" ? "ar" : "en", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="mt-2 inline-flex rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1 text-sm font-semibold text-white">
                        {statusLabel(m.status, locale)}
                      </div>
                    </div>

                    <TeamNameWithLogo
                      name={pickLang(m.awayTeam.nameAr, m.awayTeam.nameEn, locale)}
                      logoUrl={m.awayTeam.logoUrl}
                      align="end"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 border-t border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200 md:grid-cols-3">
                    <div className="font-semibold text-white">
                      {pickLang(m.competition.nameAr, m.competition.nameEn, locale)}{" "}
                      <span className="ms-1 text-neutral-400">[Cup]</span>
                    </div>
                    <div className="text-neutral-300">
                      {m.referee
                        ? (locale === "ar" ? `\u0627\u0644\u062d\u0643\u0645: ${m.referee}` : `Referee: ${m.referee}`)
                        : (locale === "ar" ? "\u0627\u0644\u062d\u0643\u0645: -" : "Referee: -")}
                    </div>
                    <div className="md:text-end text-neutral-300">
                      {m.streamName
                        ? (locale === "ar" ? `\u0627\u0644\u0642\u0646\u0627\u0629: ${m.streamName}` : `Channel: ${m.streamName}`)
                        : (locale === "ar" ? "\u0627\u0644\u0642\u0646\u0627\u0629: -" : "Channel: -")}
                    </div>
                  </div>

                  <div className="border-t border-neutral-800 bg-neutral-900/60 px-4 py-3">
                    <Button href={`/${locale}/match/${m.slug}/watch`} variant="primary">
                      {locale === "ar" ? "\u0645\u0634\u0627\u0647\u062f\u0629 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629" : "Watch match"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={locale === "ar" ? "\u0623\u062e\u0628\u0627\u0631 \u0631\u064a\u0627\u0636\u064a\u0629" : "Sports News"}
              subtitle={locale === "ar" ? "\u0622\u062e\u0631 \u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0627\u0644\u0631\u064a\u0627\u0636\u064a\u0629" : "Latest sports updates"}
            />
            <div id="news" className="p-4 grid md:grid-cols-3 gap-4">
              {news.map((n) => (
                <Link key={n.id} href={`/${locale}/news/${n.slug}`} className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 hover:bg-neutral-900 transition">
                  <img
                    src={n.coverUrl || buildNewsImageUrl(pickLang(n.titleAr, n.titleEn, locale), locale)}
                    alt={pickLang(n.titleAr, n.titleEn, locale)}
                    loading="lazy"
                    className="h-40 w-full rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs text-neutral-400">
                    {new Date(n.publishedAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
                    {n.category ? <span className="mx-2">|</span> : null}
                    {n.category ? pickLang(n.category.nameAr, n.category.nameEn, locale) : null}
                  </div>
                  <div className="mt-2 font-semibold">{pickLang(n.titleAr, n.titleEn, locale)}</div>
                  <div className="mt-2 text-sm text-neutral-300 line-clamp-3">
                    {pickLang(n.excerptAr ?? "", n.excerptEn, locale)}
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-4 pb-4">
              <Button href={`/${locale}/news`} variant="primary">{locale === "ar" ? "\u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u0623\u062e\u0628\u0627\u0631" : "All news"}</Button>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
