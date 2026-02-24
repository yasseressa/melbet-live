import { prisma } from "@/src/lib/prisma";
import { isLocale, Locale } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { createMatch, deleteMatch } from "./actions";

export default async function AdminMatches({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  const [matches, teams, competitions] = await Promise.all([
    prisma.match.findMany({ orderBy: { startsAt: "desc" }, include: { homeTeam: true, awayTeam: true, competition: true }, take: 50 }),
    prisma.team.findMany({ orderBy: { nameAr: "asc" } }),
    prisma.competition.findMany({ orderBy: { nameAr: "asc" } }),
  ]);

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader title={locale === "ar" ? "إضافة مباراة" : "Create match"} />
            <form action={createMatch} className="p-4 grid md:grid-cols-5 gap-3 text-sm">
              <input name="slug" placeholder="slug" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required />
              <input name="startsAt" type="datetime-local" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required />
              <select name="competitionId" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required>
                <option value="">{locale === "ar" ? "اختر البطولة" : "Competition"}</option>
                {competitions.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
              <select name="homeTeamId" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required>
                <option value="">{locale === "ar" ? "الفريق صاحب الأرض" : "Home team"}</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.nameAr}</option>)}
              </select>
              <select name="awayTeamId" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required>
                <option value="">{locale === "ar" ? "الفريق الضيف" : "Away team"}</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.nameAr}</option>)}
              </select>
              <div className="md:col-span-5">
                <Button type="submit">{locale === "ar" ? "حفظ" : "Save"}</Button>
                <span className="mx-3 text-xs text-neutral-500">{locale === "ar" ? "نصيحة: اجعل الـ slug فريدًا." : "Tip: keep slug unique."}</span>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title={locale === "ar" ? "آخر المباريات" : "Matches"} />
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950/40 text-neutral-300">
                  <tr>
                    <th className="p-3 text-start">Time</th>
                    <th className="p-3 text-start">Match</th>
                    <th className="p-3 text-start">Competition</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} className="border-t border-neutral-800">
                      <td className="p-3">{new Date(m.startsAt).toLocaleString(locale === "ar" ? "ar" : "en")}</td>
                      <td className="p-3">{m.homeTeam.nameAr} vs {m.awayTeam.nameAr}</td>
                      <td className="p-3">{m.competition.nameAr}</td>
                      <td className="p-3 text-end">
                        <form action={deleteMatch}>
                          <input type="hidden" name="id" value={m.id} />
                          <Button type="submit" variant="ghost">{locale === "ar" ? "حذف" : "Delete"}</Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button href={`/${locale}/admin`} variant="ghost">{locale === "ar" ? "رجوع" : "Back"}</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
