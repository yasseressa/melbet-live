import { isLocale, Locale, pickLang } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { baseUrl, resolveMatch, statusLabel } from "@/src/lib/match-page";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const match = await resolveMatch(params.slug);
  if (!match) {
    const title = locale === "ar" ? "\u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629" : "Match not found";
    return { title, robots: { index: false, follow: false } };
  }

  const home = pickLang(match.homeTeam.nameAr, match.homeTeam.nameEn, locale);
  const away = pickLang(match.awayTeam.nameAr, match.awayTeam.nameEn, locale);
  const comp = pickLang(match.competition.nameAr, match.competition.nameEn, locale);
  const title = locale === "ar" ? `${home} \u0636\u062f ${away} | ${comp}` : `${home} vs ${away} | ${comp}`;
  const description = locale === "ar"
    ? `\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0628\u0627\u0631\u0627\u0629 ${home} \u0636\u062f ${away}.`
    : `Match details for ${home} vs ${away}.`;
  const url = `${baseUrl()}/${locale}/match/${match.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${baseUrl()}/ar/match/${match.slug}`,
        en: `${baseUrl()}/en/match/${match.slug}`,
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

export default async function MatchPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const match = await resolveMatch(params.slug);

  if (!match) {
    return (
      <main className="py-10">
        <Container>
          <Card>
            <CardHeader title={locale === "ar" ? "\u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629" : "Match not found"} />
            <div className="p-4"><Button href={`/${locale}`} variant="primary">{locale === "ar" ? "\u0627\u0644\u0639\u0648\u062f\u0629" : "Back"}</Button></div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm text-neutral-400">{pickLang(match.competition.nameAr, match.competition.nameEn, locale)}</div>
              <h1 className="text-2xl font-bold mt-1">
                {pickLang(match.homeTeam.nameAr, match.homeTeam.nameEn, locale)} <span className="text-neutral-500">{locale === "ar" ? "\u0636\u062f" : "vs"}</span>{" "}
                {pickLang(match.awayTeam.nameAr, match.awayTeam.nameEn, locale)}
              </h1>
              <div className="mt-2 text-sm text-neutral-300">
                {new Date(match.startsAt).toLocaleString(locale === "ar" ? "ar" : "en")} | {statusLabel(match.status, locale)}
              </div>
            </div>
            <Button href={`/${locale}`} variant="ghost">{locale === "ar" ? "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "Home"}</Button>
          </div>

          <Card>
            <CardHeader
              title={locale === "ar" ? "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629" : "Match Details"}
              subtitle={locale === "ar" ? "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629 \u0648\u0648\u0642\u062a\u0647\u0627" : "Match info and schedule"}
            />
            <div className="p-4 space-y-3 text-sm text-neutral-300">
              <div>
                {locale === "ar" ? "\u0627\u0644\u062a\u0648\u0642\u064a\u062a:" : "Kickoff:"}{" "}
                {new Date(match.startsAt).toLocaleString(locale === "ar" ? "ar" : "en")}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u062d\u0627\u0644\u0629:" : "Status:"}{" "}
                {statusLabel(match.status, locale)}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u0646\u0642\u0636\u064a:" : "Elapsed:"}{" "}
                {match.elapsed ?? "-"}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u0628\u0637\u0648\u0644\u0629:" : "Competition:"}{" "}
                {pickLang(match.competition.nameAr, match.competition.nameEn, locale)}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u062f\u0648\u0644\u0629 / \u0627\u0644\u062c\u0648\u0644\u0629:" : "Country / Round:"}{" "}
                {[match.leagueCountry, match.leagueRound].filter(Boolean).join(" / ") || "-"}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u0645\u0644\u0639\u0628:" : "Venue:"}{" "}
                {[match.venue?.name, match.venue?.city].filter(Boolean).join(" - ") || "-"}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u062d\u0643\u0645:" : "Referee:"}{" "}
                {match.referee || "-"}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0632\u0645\u0646\u064a:" : "Timezone:"}{" "}
                {match.timezone || "-"}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u0646\u062a\u064a\u062c\u0629:" : "Score:"}{" "}
                {(match.score?.home ?? "-") + " - " + (match.score?.away ?? "-")}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u0634\u0648\u0637 \u0627\u0644\u0623\u0648\u0644 / \u0627\u0644\u062b\u0627\u0646\u064a:" : "1st/2nd period:"}{" "}
                {(match.periods?.first ?? "-") + " / " + (match.periods?.second ?? "-")}
              </div>
              <div>
                {locale === "ar" ? "\u0627\u0644\u0641\u0627\u0626\u0632 \u0627\u0644\u0645\u062a\u0648\u0642\u0639:" : "Winner flags:"}{" "}
                {`${pickLang(match.homeTeam.nameAr, match.homeTeam.nameEn, locale)}: ${String(match.homeTeam.winner ?? "-")}, ${pickLang(match.awayTeam.nameAr, match.awayTeam.nameEn, locale)}: ${String(match.awayTeam.winner ?? "-")}`}
              </div>
              <div className="pt-2">
                <Button href={`/${locale}/match/${match.slug}/watch`}>
                  {locale === "ar" ? "\u0645\u0634\u0627\u0647\u062f\u0629 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629" : "Watch the match"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
