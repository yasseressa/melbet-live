import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/src/lib/i18n";
import { Button, Container } from "@/src/components/ui";
import { prisma } from "@/src/lib/prisma";

function SocialIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "TELEGRAM":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M20.7 3.3a1 1 0 0 0-1-.2L3 9.5a1 1 0 0 0 .1 1.9l4.2 1.3 1.6 5.3a1 1 0 0 0 1.8.3l2.4-3.4 3.9 2.9a1 1 0 0 0 1.6-.6l2.4-12.9a1 1 0 0 0-.3-1zM9 12.3l7.8-5.3-6.5 6.6-.6 2-0.7-3.3z" />
        </svg>
      );
    case "WHATSAPP":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.5.6c-.1.1-.3.2-.5.1a6.8 6.8 0 0 1-3.3-2.9c-.2-.3 0-.4.1-.6l.3-.4c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.8-.9 2s.9 2.4 1 2.6a9.8 9.8 0 0 0 3.8 3.6c1.9.8 1.9.5 2.3.5.4 0 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2z" />
        </svg>
      );
    case "EMAIL":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.6 2L12 12.4 19.4 7H4.6zM4 9v8h16V9l-7.4 5.3a1 1 0 0 1-1.2 0L4 9z" />
        </svg>
      );
    case "INSTAGRAM":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.8 6.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1z" />
        </svg>
      );
    case "FACEBOOK":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6V11H7v3h2.6v8h3.9z" />
        </svg>
      );
    default:
      return null;
  }
}

function socialLabel(kind: string, locale: Locale) {
  switch (kind) {
    case "TELEGRAM":
      return locale === "ar" ? "\u062a\u064a\u0644\u064a\u062c\u0631\u0627\u0645" : "Telegram";
    case "WHATSAPP":
      return locale === "ar" ? "\u0648\u0627\u062a\u0633\u0627\u0628" : "WhatsApp";
    case "EMAIL":
      return locale === "ar" ? "\u0627\u0644\u0628\u0631\u064a\u062f" : "Email";
    case "INSTAGRAM":
      return locale === "ar" ? "\u0625\u0646\u0633\u062a\u063a\u0631\u0627\u0645" : "Instagram";
    case "FACEBOOK":
      return locale === "ar" ? "\u0641\u064a\u0633\u0628\u0648\u0643" : "Facebook";
    default:
      return kind;
  }
}

function socialButtonClass(kind: string) {
  switch (kind) {
    case "TELEGRAM":
      return "border-[#229ED9] bg-[#229ED9] text-white hover:opacity-90";
    case "WHATSAPP":
      return "border-[#25D366] bg-[#25D366] text-white hover:opacity-90";
    case "EMAIL":
      return "border-[#FFB020] bg-[#FFB020] text-black hover:opacity-90";
    case "INSTAGRAM":
      return "border-[#E4405F] bg-[#E4405F] text-white hover:opacity-90";
    case "FACEBOOK":
      return "border-[#1877F2] bg-[#1877F2] text-white hover:opacity-90";
    default:
      return "border-neutral-800 bg-neutral-950/50 text-white hover:bg-neutral-900";
  }
}

export default async function Header({ locale }: { locale: Locale }) {
  const social = await prisma.socialLink.findMany({ where: { enabled: true } });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <Link href={`/${locale}`} className="block w-full">
        <Image
          src="/brand/melbet-logo.jpg"
          alt="Melbet"
          width={1400}
          height={500}
          sizes="100vw"
          priority
          className="block h-16 w-full object-contain sm:h-18"
        />
      </Link>

      <Container>
        <div className="flex items-center justify-between py-3 gap-3">
          <nav className="hidden md:flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 p-1 text-sm">
            <Link
              href={`/${locale}`}
              className="rounded-full bg-melbet-yellow px-4 py-2 font-semibold text-black transition hover:opacity-90"
            >
              {locale === "ar" ? "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "Home"}
            </Link>
            <Link
              href={`/${locale}#today`}
              className="rounded-full bg-melbet-yellow px-4 py-2 font-semibold text-black transition hover:opacity-90"
            >
              {locale === "ar" ? "\u0627\u0644\u0645\u0628\u0627\u0631\u064a\u0627\u062a" : "Matches"}
            </Link>
            <Link
              href={`/${locale}#news`}
              className="rounded-full bg-melbet-yellow px-4 py-2 font-semibold text-black transition hover:opacity-90"
            >
              {locale === "ar" ? "\u0627\u0644\u0623\u062e\u0628\u0627\u0631" : "News"}
            </Link>
          </nav>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {social.map((s) => (
              <Button key={s.kind} href={s.url} variant="social" className={socialButtonClass(s.kind)}>
                <span className="inline-flex items-center gap-2">
                  <SocialIcon kind={s.kind} />
                  <span>{socialLabel(s.kind, locale)}</span>
                </span>
              </Button>
            ))}
            <Link
              href={locale === "ar" ? "/en" : "/ar"}
              className="inline-flex h-9 w-12 items-center justify-center rounded-full border border-melbet-yellow bg-melbet-yellow text-xs font-bold text-black transition hover:opacity-90"
              aria-label={locale === "ar" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
              title={locale === "ar" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
            >
              {locale === "ar" ? "EN" : "AR"}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
