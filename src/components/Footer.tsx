import { Container } from "@/src/components/ui";
import { Locale } from "@/src/lib/i18n";

export default function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-neutral-800 py-8 mt-10">
      <Container>
        <div className="flex items-center justify-between gap-3 flex-wrap text-sm text-neutral-400">
          <div>© {new Date().getFullYear()} Melbet-Live</div>
        </div>
      </Container>
    </footer>
  );
}
