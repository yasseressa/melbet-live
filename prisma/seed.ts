import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, SocialKind, MatchStatus } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean (dev only)
  await prisma.stream.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.news.deleteMany();
  await prisma.newsCategory.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.popupLink.deleteMany();

  const teamA = await prisma.team.create({
    data: { nameAr: "ريال مدريد", nameEn: "Real Madrid", shortName: "RMA" },
  });
  const teamB = await prisma.team.create({
    data: { nameAr: "برشلونة", nameEn: "Barcelona", shortName: "FCB" },
  });

  const comp = await prisma.competition.create({
    data: { nameAr: "الدوري الإسباني", nameEn: "La Liga", country: "ES" },
  });

  const now = new Date();
  const match = await prisma.match.create({
    data: {
      slug: "real-madrid-vs-barcelona",
      startsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: MatchStatus.SCHEDULED,
      homeTeamId: teamA.id,
      awayTeamId: teamB.id,
      competitionId: comp.id,
      streams: {
        create: [
          {
            provider: "TBD",
            playbackUrl: "https://example.com/your-legal-playback.m3u8",
            enabled: false
          },
        ],
      },
    },
  });

  const cat = await prisma.newsCategory.create({
    data: { nameAr: "أخبار عامة", nameEn: "General" },
  });

  await prisma.news.createMany({
    data: [
      {
        slug: "platform-launch",
        titleAr: "إطلاق نسخة تجريبية للمنصة",
        titleEn: "Platform beta launch",
        excerptAr: "بدء تشغيل النسخة التجريبية مع جدول مباريات وأخبار وروابط.",
        excerptEn: "Beta release with matches, news and links.",
        contentHtmlAr: "<p>هذه نسخة تجريبية جاهزة للتطوير والتخصيص.</p>",
        contentHtmlEn: "<p>This is a customizable beta build.</p>",
        categoryId: cat.id,
        coverUrl: "/images/news-1.jpg"
      },
      {
        slug: "today-matches",
        titleAr: "مباريات اليوم: نظرة سريعة",
        titleEn: "Today matches: quick look",
        excerptAr: "تحديثات ومواعيد أبرز المباريات.",
        excerptEn: "Key fixtures and times.",
        contentHtmlAr: "<p>أضف أخبارك من لوحة الإدارة بسهولة.</p>",
        contentHtmlEn: "<p>Add your news easily from the admin panel.</p>",
        categoryId: cat.id,
        coverUrl: "/images/news-2.jpg"
      }
    ]
  });

  await prisma.socialLink.createMany({
    data: [
      { kind: SocialKind.TELEGRAM, url: "https://t.me/yourchannel", enabled: true },
      { kind: SocialKind.WHATSAPP, url: "https://wa.me/1234567890", enabled: true },
      { kind: SocialKind.EMAIL, url: "mailto:info@example.com", enabled: true },
      { kind: SocialKind.INSTAGRAM, url: "https://instagram.com/yourpage", enabled: true },
      { kind: SocialKind.FACEBOOK, url: "https://facebook.com/yourpage", enabled: true },
    ],
  });

  await prisma.popupLink.createMany({
    data: [
      { titleAr: "روابط خاصة", titleEn: "Custom links", url: "https://example.com", enabled: true, sort: 1 },
      { titleAr: "قناة التحديثات", titleEn: "Updates channel", url: "https://t.me/yourchannel", enabled: true, sort: 2 },
    ],
  });

  console.log("Seed done", { matchId: match.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
