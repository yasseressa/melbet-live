function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export default function robots() {
  const base = baseUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/" }
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
