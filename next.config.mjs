function normalizeOriginHost(value) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return value.replace(/^https?:\/\//, "").trim() || null;
  }
}

const allowedOrigins = Array.from(
  new Set(
    [
      "localhost:3000",
      "127.0.0.1:3000",
      normalizeOriginHost(process.env.NEXT_PUBLIC_BASE_URL),
      normalizeOriginHost(process.env.VERCEL_URL),
      normalizeOriginHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
      ...(process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((v) => normalizeOriginHost(v))
        .filter(Boolean),
    ].filter(Boolean),
  ),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      allowedOrigins
    }
  }
};

export default nextConfig;
