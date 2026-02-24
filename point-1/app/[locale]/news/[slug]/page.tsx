import { prisma } from "@/src/lib/prisma";
import { isLocale, Locale, pickLang } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { buildNewsImageUrl } from "@/src/lib/news-images";
import type { Metadata } from "next";

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  const article = await prisma.news.findFirst({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!article) {
    const title = locale === "ar" ? "الخبر غير موجود" : "Not found";
    return { title, robots: { index: false, follow: false } };
  }

  const title = pickLang(article.titleAr, article.titleEn, locale);
  const description = pickLang(article.excerptAr ?? "", article.excerptEn, locale) || title;
  const url = `${baseUrl()}/${locale}/news/${article.slug}`;
  const image = article.coverUrl?.startsWith("http") ? article.coverUrl : (article.coverUrl ? `${baseUrl()}${article.coverUrl}` : undefined);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${baseUrl()}/ar/news/${article.slug}`,
        en: `${baseUrl()}/en/news/${article.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "Melbet Partner",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function NewsArticle({ params }: { params: { locale: string; slug: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  const article = await prisma.news.findFirst({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!article) {
    return (
      <main className="py-10">
        <Container>
          <Card>
            <CardHeader title={locale === "ar" ? "الخبر غير موجود" : "Not found"} />
            <div className="p-4">
            <Button href={`/${locale}/news`} variant="primary">{locale === "ar" ? "رجوع" : "Back"}</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  const title = pickLang(article.titleAr, article.titleEn, locale);
  const html = pickLang(article.contentHtmlAr, article.contentHtmlEn, locale);
  const image = article.coverUrl || buildNewsImageUrl(title, locale);

  return (
    <main className="py-8">
      <Container>
        <Card>
          <CardHeader
            title={title}
            subtitle={`${new Date(article.publishedAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}${article.category ? " • " + pickLang(article.category.nameAr, article.category.nameEn, locale) : ""}`}
          />
          <div className="px-6 pt-6">
            <img
              src={image}
              alt={title}
              className="h-64 w-full rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-6 prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="px-6 pb-6 flex gap-2 flex-wrap">
            <Button href={`/${locale}/news`} variant="primary">{locale === "ar" ? "كل الأخبار" : "All news"}</Button>
            <Button href={`/${locale}`} variant="primary">{locale === "ar" ? "الرئيسية" : "Home"}</Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}


