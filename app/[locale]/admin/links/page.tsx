import { prisma } from "@/src/lib/prisma";
import { isLocale, Locale } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { createPopup, deletePopup, upsertSocial } from "./actions";

const SOCIAL = ["TELEGRAM","WHATSAPP","EMAIL","INSTAGRAM","FACEBOOK"] as const;

export default async function AdminLinks({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const [social, popup] = await Promise.all([
    prisma.socialLink.findMany({ orderBy: { kind: "asc" } }),
    prisma.popupLink.findMany({ orderBy: { sort: "asc" } }),
  ]);
  const socialMap = new Map(social.map(s => [s.kind, s]));

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader title={locale === "ar" ? "أزرار التواصل" : "Social buttons"} subtitle={locale === "ar" ? "تعديل روابط تلغرام/واتس/..." : "Configure Telegram/WhatsApp/..."} />
            <div className="p-4 grid md:grid-cols-2 gap-4 text-sm">
              {SOCIAL.map((k) => {
                const s = socialMap.get(k as any);
                return (
                  <form key={k} action={upsertSocial} className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-2">
                    <div className="font-semibold">{k}</div>
                    <input type="hidden" name="kind" value={k} />
                    <input name="url" defaultValue={s?.url ?? ""} placeholder="https://..." className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required />
                    <label className="flex items-center gap-2 text-xs text-neutral-300">
                      <input type="checkbox" name="enabled" defaultChecked={s?.enabled ?? true} />
                      {locale === "ar" ? "مفعل" : "Enabled"}
                    </label>
                    <Button type="submit">{locale === "ar" ? "حفظ" : "Save"}</Button>
                  </form>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title={locale === "ar" ? "الروابط المنبثقة" : "Popup links"} />
            <form action={createPopup} className="p-4 grid md:grid-cols-5 gap-3 text-sm">
              <input name="titleAr" placeholder={locale === "ar" ? "العنوان بالعربية" : "Arabic title"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required />
              <input name="titleEn" placeholder={locale === "ar" ? "العنوان بالإنجليزية (اختياري)" : "English title (optional)"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
              <input name="url" placeholder="https://..." className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 md:col-span-2" required />
              <div className="flex items-center gap-3">
                <input name="sort" type="number" defaultValue={0} className="w-24 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
                <label className="flex items-center gap-2 text-xs text-neutral-300">
                  <input type="checkbox" name="enabled" defaultChecked />
                  {locale === "ar" ? "مفعل" : "Enabled"}
                </label>
              </div>
              <div className="md:col-span-5">
                <Button type="submit">{locale === "ar" ? "إضافة" : "Add"}</Button>
              </div>
            </form>

            <div className="p-4 pt-0 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950/40 text-neutral-300">
                  <tr>
                    <th className="p-3 text-start">{locale === "ar" ? "العنوان" : "Title"}</th>
                    <th className="p-3 text-start">URL</th>
                    <th className="p-3 text-start">{locale === "ar" ? "ترتيب" : "Sort"}</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {popup.map((p) => (
                    <tr key={p.id} className="border-t border-neutral-800">
                      <td className="p-3">{p.titleAr}</td>
                      <td className="p-3 text-xs break-all text-neutral-300">{p.url}</td>
                      <td className="p-3">{p.sort}</td>
                      <td className="p-3 text-end">
                        <form action={deletePopup}>
                          <input type="hidden" name="id" value={p.id} />
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
