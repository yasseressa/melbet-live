# Deploy to Vercel (Next.js + Prisma + Aiven MySQL)

This project is ready for Vercel deployment. Use your existing Aiven MySQL database (or another hosted MySQL DB).

## 1. Push code to GitHub

Push this repo to GitHub/GitLab/Bitbucket.

## 2. Create Vercel project

- Go to Vercel
- Click `Add New...` -> `Project`
- Import your repo
- Framework should auto-detect as `Next.js`

This repo includes `vercel.json` using:

- `buildCommand = npm run vercel-build`

## 3. Add environment variables in Vercel

Go to `Project Settings` -> `Environment Variables` and add values from `.env.vercel.example`.

Required minimum:

- `DATABASE_URL` (hosted MySQL, e.g. Aiven URL with `ssl-mode=REQUIRED`)
- `NEXT_PUBLIC_BASE_URL` (your Vercel domain)
- `ADMIN_PASSWORD`

Recommended:

- `SERVER_ACTIONS_ALLOWED_ORIGINS` = your Vercel domain (comma-separated if multiple)
- API keys (`FOOTBALL_*`) if you want sync/news features

## 4. Deploy

Click `Deploy`.

## 5. Initialize database schema (important)

Vercel build does not automatically apply schema changes. Run this once after deploy (from your local machine in this repo):

```bash
npx prisma db push
```

Make sure your local `.env` points to the same production `DATABASE_URL` before running it.

## 6. Add data (new DBs are empty)

- Social buttons: `/ar/admin/links`
- News: `/ar/admin/news`

Or run sync scripts locally against the same `DATABASE_URL`:

```bash
npm run db:sync:news
npm run db:sync
```

## Notes

- This app uses Prisma + MariaDB adapter for runtime DB access. The repo includes an Aiven TLS workaround.
- `next.config.mjs` already allows server actions for localhost, explicit env origins, and Vercel preview/production domains.
- If you later add a custom domain, update `NEXT_PUBLIC_BASE_URL` and redeploy.
