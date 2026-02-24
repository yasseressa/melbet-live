import { prisma } from "@/src/lib/prisma";
import { isLocale, Locale } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { createNews, deleteNews } from "./actions";

export default async function AdminNews({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const news = await prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 50 });

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader title={locale === "ar" ? "إضافة خبر" : "Create news"} subtitle={locale === "ar" ? "اكتب HTML بسيط (p, h2, ul...)" : "Use simple HTML (p, h2, ul...)"} />
            <form action={createNews} className="p-4 grid md:grid-cols-2 gap-3 text-sm">
              <input name="slug" placeholder="slug" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required />
              <input name="titleAr" placeholder={locale === "ar" ? "عنوان عربي" : "Arabic title"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" required />
              <input name="titleEn" placeholder={locale === "ar" ? "عنوان إنجليزي (اختياري)" : "English title (optional)"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
              <input name="coverUrl" placeholder="Image URL (optional)" className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
              <input name="excerptAr" placeholder={locale === "ar" ? "ملخص عربي (اختياري)" : "Arabic excerpt"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
              <input name="excerptEn" placeholder={locale === "ar" ? "ملخص إنجليزي (اختياري)" : "English excerpt"} className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
              <textarea name="contentHtmlAr" placeholder={locale === "ar" ? "محتوى HTML بالعربية" : "Arabic HTML content"} className="min-h-[160px] rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 md:col-span-2" required />
              <textarea name="contentHtmlEn" placeholder={locale === "ar" ? "محتوى HTML بالإنجليزية (اختياري)" : "English HTML content"} className="min-h-[160px] rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 md:col-span-2" />
              <div className="md:col-span-2">
                <Button type="submit">{locale === "ar" ? "نشر" : "Publish"}</Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title={locale === "ar" ? "آخر الأخبار" : "News"} />
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950/40 text-neutral-300">
                  <tr>
                    <th className="p-3 text-start">Title</th>
                    <th className="p-3 text-start">Date</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((n) => (
                    <tr key={n.id} className="border-t border-neutral-800">
                      <td className="p-3">{n.titleAr}</td>
                      <td className="p-3">{new Date(n.publishedAt).toLocaleString(locale === "ar" ? "ar" : "en")}</td>
                      <td className="p-3 text-end">
                        <form action={deleteNews}>
                          <input type="hidden" name="id" value={n.id} />
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

