# Milbet Sports (Pro)

Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + MySQL  
Arabic (default, RTL) + English

## تشغيل محليًا (Local)

1) انسخ ملف البيئة:
```bash
cp .env.example .env
```
ثم عدّل `DATABASE_URL` وكلمة مرور `ADMIN_PASSWORD`.

2) ثبّت الحزم:
```bash
npm install
```

3) أنشئ الجداول:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) (اختياري) بيانات تجريبية:
```bash
npm run db:seed
```

5) شغّل:
```bash
npm run dev
```

افتح:
- http://localhost:3000 (سيحوّل تلقائيًا إلى /ar)
- لوحة الإدارة: /ar/admin (كلمة المرور من .env)

## ملاحظات مهمة
- صفحة المباراة تعرض مكان جاهز للمشغّل. اربط فقط روابط تشغيل **قانونية/مرخّصة** في Streams.
- الشعار موجود في: `public/brand/melbet-logo.png`

Generated: 2026-02-13T10:05:28.917509Z

## SEO
- Dynamic Metadata for match/news pages (OpenGraph/Twitter)
- /sitemap.xml and /robots.txt generated automatically

## Player
- HLS player integrated using hls.js. Enable a stream in Admin > Streams.

## Automatic Match/Team Sync
- This project supports automatic ingestion of competitions, teams, and matches from `football-data.org`.
- Configure these variables in `.env`:
```bash
FOOTBALL_DATA_API_KEY="your_token_here"
FOOTBALL_DATA_BASE_URL="https://api.football-data.org/v4"
FOOTBALL_DATA_COMPETITIONS="PL,PD,SA,BL1,FL1,DED"
FOOTBALL_DATA_DAYS_PAST="0"
FOOTBALL_DATA_DAYS_FUTURE="7"
```
- Run sync:
```bash
npm run db:sync
```
- Suggested schedule:
1. Every 15 minutes for near-live fixtures/status.
2. Once daily for broader future fixtures.

## Automatic Football News Sync
- This project also supports automatic football news ingestion from `GNews`.
- Configure these variables in `.env`:
```bash
FOOTBALL_NEWS_API_KEY="your_token_here"
FOOTBALL_NEWS_BASE_URL="https://gnews.io/api/v4"
FOOTBALL_NEWS_QUERY="football OR soccer"
FOOTBALL_NEWS_LANG="en"
FOOTBALL_NEWS_COUNTRY=""
FOOTBALL_NEWS_MAX="20"
FOOTBALL_NEWS_DAYS_BACK="2"
```
- Run news sync:
```bash
npm run db:sync:news
```
- Run both fixtures + news:
```bash
npm run db:sync:all
```

## Xtream Streams (Optional)
- Match page now tries Xtream stream auto-matching first, then falls back to your saved Admin stream URL.
- Configure these variables in `.env`:
```bash
XTREAM_HOST="http://free.raskiptv.com:8080"
XTREAM_USERNAME=""
XTREAM_PASSWORD=""
XTREAM_OUTPUT="m3u8"
```
- Important:
1. Xtream is not a free public stream API by itself.
2. You must use your own valid provider credentials.
3. Only use licensed/legal streams.
