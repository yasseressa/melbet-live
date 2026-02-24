import { prisma } from "@/src/lib/prisma";
import { isLocale, Locale, pickLang } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { buildNewsImageUrl } from "@/src/lib/news-images";
import Link from "next/link";

export default async function NewsList({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  const rawNews = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
    include: { category: true },
    take: 120,
  });
  const preferredSourceLang = locale === "ar" ? "AR" : "EN";
  const news = [
    ...rawNews.filter((item) => item.sourceLang === preferredSourceLang),
    ...rawNews.filter((item) => item.sourceLang !== preferredSourceLang),
  ].slice(0, 50);

  return (
    <main className="py-8">
      <Container>
        <Card>
          <CardHeader title={locale === "ar" ? "الأخبار" : "News"} subtitle={locale === "ar" ? "آخر الأخبار الرياضية" : "Latest sports updates"} />
          <div className="p-4 grid md:grid-cols-3 gap-4">
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
                  {n.category ? <span className="mx-2">•</span> : null}
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
            <Button href={`/${locale}`} variant="primary">{locale === "ar" ? "العودة للرئيسية" : "Back home"}</Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}
