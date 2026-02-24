import { prisma } from "@/src/lib/prisma";
import { isLocale, Locale } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { createStream, deleteStream, toggleStream } from "./actions";

export default async function AdminStreams({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  const [matches, streams] = await Promise.all([
    prisma.match.findMany({ orderBy: { startsAt: "desc" }, include: { homeTeam: true, awayTeam: true }, take: 50 }),
    prisma.stream.findMany({ orderBy: { createdAt: "desc" }, include: { match: { include: { homeTeam: true, awayTeam: true } } }, take: 100 }),
  ]);

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader title={locale === "ar" ? "إضافة رابط بث" : "Add stream"} subtitle={locale === "ar" ? "أضف رابط تشغيل قانوني فقط (HLS/DASH)" : "Add licensed playback URL only"} />
            <form action={createStream} className="p-4 grid md:grid-cols-5 gap-3 text-sm">
              <select name="matchId" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 md:col-span-2" required>
                <option value="">{locale === "ar" ? "اختر مباراة" : "Select match"}</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {new Date(m.startsAt).toLocaleString(locale === "ar" ? "ar" : "en")} — {m.homeTeam.nameAr} vs {m.awayTeam.nameAr}
                  </option>
                ))}
              </select>
              <input name="provider" placeholder={locale === "ar" ? "المزود (اختياري)" : "Provider (optional)"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
              <input name="playbackUrl" placeholder="https://...m3u8" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 md:col-span-2" required />
              <div className="md:col-span-5 flex gap-4 flex-wrap items-center">
                <label className="flex items-center gap-2 text-xs text-neutral-300">
                  <input type="checkbox" name="enabled" defaultChecked={false} />
                  {locale === "ar" ? "مفعل" : "Enabled"}
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-300">
                  <input type="checkbox" name="isPrimary" defaultChecked />
                  {locale === "ar" ? "أساسي" : "Primary"}
                </label>
                <Button type="submit">{locale === "ar" ? "إضافة" : "Add"}</Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title={locale === "ar" ? "روابط البث" : "Streams"} />
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950/40 text-neutral-300">
                  <tr>
                    <th className="p-3 text-start">{locale === "ar" ? "المباراة" : "Match"}</th>
                    <th className="p-3 text-start">URL</th>
                    <th className="p-3 text-start">{locale === "ar" ? "مفعل" : "Enabled"}</th>
                    <th className="p-3 text-start">{locale === "ar" ? "أساسي" : "Primary"}</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map((s) => (
                    <tr key={s.id} className="border-t border-neutral-800">
                      <td className="p-3">{s.match.homeTeam.nameAr} vs {s.match.awayTeam.nameAr}</td>
                      <td className="p-3 text-xs break-all text-neutral-300">{s.playbackUrl}</td>
                      <td className="p-3">{s.enabled ? "Yes" : "No"}</td>
                      <td className="p-3">{s.isPrimary ? "Yes" : "No"}</td>
                      <td className="p-3 text-end flex gap-2 justify-end">
                        <form action={toggleStream}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="enabled" value={s.enabled ? "0" : "1"} />
                          <Button type="submit" variant="ghost">{s.enabled ? (locale==="ar" ? "تعطيل" : "Disable") : (locale==="ar" ? "تفعيل" : "Enable")}</Button>
                        </form>
                        <form action={deleteStream}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="ghost">{locale === "ar" ? "حذف" : "Delete"}</Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Button href={`/${locale}/admin`} variant="ghost">{locale === "ar" ? "رجوع" : "Back"}</Button>
        </div>
      </Container>
    </main>
  );
}

