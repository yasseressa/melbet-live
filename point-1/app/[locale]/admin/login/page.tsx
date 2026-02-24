import { adminLogin } from "./actions";
import { isLocale, Locale } from "@/src/lib/i18n";
import { Button, Card, CardHeader, Container } from "@/src/components/ui";
import { redirect } from "next/navigation";

export default function AdminLogin({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "ar") as Locale;

  async function onSubmit(formData: FormData) {
    "use server";
    const res = await adminLogin(formData);
    if (res.ok) redirect(`/${locale}/admin`);
    redirect(`/${locale}/admin/login?err=1`);
  }

  return (
    <main className="py-10">
      <Container>
        <Card>
          <CardHeader title={locale === "ar" ? "تسجيل دخول الإدارة" : "Admin Login"} subtitle={locale === "ar" ? "أدخل كلمة المرور من ملف .env" : "Password from .env"} />
          <form action={onSubmit} className="p-4 space-y-3">
            <input
              name="password"
              type="password"
              placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm"
              required
            />
            <Button type="submit">{locale === "ar" ? "دخول" : "Login"}</Button>
            <div className="text-xs text-neutral-500">
              {locale === "ar" ? "غيّر ADMIN_PASSWORD في .env قبل النشر." : "Change ADMIN_PASSWORD in .env before deploying."}
            </div>
          </form>
        </Card>
      </Container>
    </main>
  );
}
