import { prisma } from "@/src/lib/prisma";
import { Locale, pickLang } from "@/src/lib/i18n";
import { Button, Card, CardHeader } from "@/src/components/ui";

export default async function PopupLinks({ locale }: { locale: Locale }) {
  const links = await prisma.popupLink.findMany({ where: { enabled: true }, orderBy: { sort: "asc" } });

  return (
    <Card>
      <CardHeader title={locale === "ar" ? "روابط منبثقة" : "Quick Links"} subtitle={locale === "ar" ? "ضع روابطك الخاصة من لوحة الإدارة" : "Manage your custom links from the admin panel"} />
      <div className="p-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <Button key={l.id} href={l.url} variant="ghost">
            {pickLang(l.titleAr, l.titleEn, locale)}
          </Button>
        ))}
      </div>
    </Card>
  );
}
