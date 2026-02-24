import { isLocale, Locale } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";

export default function AdminHome({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  return (
    <main className="py-8">
      <Container>
        <Card>
          <CardHeader title={locale === "ar" ? "لوحة الإدارة" : "Admin Panel"} subtitle={locale === "ar" ? "إدارة المباريات والأخبار والروابط" : "Manage matches, news and links"} />
          <div className="p-4 flex gap-2 flex-wrap">
            <Button href={`/${locale}/admin/matches`}>{locale === "ar" ? "المباريات" : "Matches"}</Button>
            <Button href={`/${locale}/admin/news`} variant="ghost">{locale === "ar" ? "الأخبار" : "News"}</Button>
            <Button href={`/${locale}/admin/links`} variant="ghost">{locale === "ar" ? "الروابط" : "Links"}</Button>
            <Button href={`/${locale}/admin/streams`} variant="ghost">{locale === "ar" ? "روابط البث" : "Streams"}</Button>
            <Button href={`/${locale}/admin/logout`} variant="ghost">{locale === "ar" ? "تسجيل خروج" : "Logout"}</Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}
