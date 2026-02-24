import { prisma } from "@/src/lib/prisma";

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export default async function sitemap() {
  const base = baseUrl();

  const [matches, news] = await Promise.all([
    prisma.match.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.news.findMany({ select: { slug: true, publishedAt: true } }),
  ]);

  const staticUrls = [
    { url: `${base}/ar`, lastModified: new Date() },
    { url: `${base}/en`, lastModified: new Date() },
    { url: `${base}/ar/news`, lastModified: new Date() },
    { url: `${base}/en/news`, lastModified: new Date() },
  ];

  const matchUrls = matches.flatMap((m) => ([
    { url: `${base}/ar/match/${m.slug}`, lastModified: m.updatedAt },
    { url: `${base}/en/match/${m.slug}`, lastModified: m.updatedAt },
    { url: `${base}/ar/match/${m.slug}/watch`, lastModified: m.updatedAt },
    { url: `${base}/en/match/${m.slug}/watch`, lastModified: m.updatedAt },
  ]));

  const newsUrls = news.flatMap((n) => ([
    { url: `${base}/ar/news/${n.slug}`, lastModified: n.publishedAt },
    { url: `${base}/en/news/${n.slug}`, lastModified: n.publishedAt },
  ]));

  return [...staticUrls, ...matchUrls, ...newsUrls];
}
