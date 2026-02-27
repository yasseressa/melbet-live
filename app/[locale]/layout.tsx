import "../globals.css";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import GlobalClickRedirect from "@/src/components/GlobalClickRedirect";
import SideAds from "@/src/components/SideAds";
import { isLocale, dir, Locale } from "@/src/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  return {
    title: locale === "ar" ? "ميلبيت لايف" : "Melbet-Live",
    description: locale === "ar"
      ? "مباريات، أخبار، وصفحات بث."
      : "Matches, news, and streaming pages.",
    icons: {
      icon: "/brand/melbet-logo.png",
      shortcut: "/brand/melbet-logo.png",
      apple: "/brand/melbet-logo.png",
    },
  };
}

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;
  return (
    <html lang={locale} dir={dir(locale)}>
      <body className="min-h-screen text-white pt-[max(16vh,8rem)] xl:px-44">
        <GlobalClickRedirect />
        <SideAds />
        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}

