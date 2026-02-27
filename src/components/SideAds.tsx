"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PARTNER_URL = "https://melbet.com/ar/slots/l?tag=d_4974371m_2170c_DAN222";

const LEFT_ADS = [
  { src: "/ads/game-1.png", alt: "Game 1 Ad" },
  { src: "/ads/game-4.png", alt: "Game 4 Ad" },
];

const RIGHT_ADS = [
  { src: "/ads/game-2.png", alt: "Game 2 Ad" },
  { src: "/ads/game-3.png", alt: "Game 3 Ad" },
];

function AdCard({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Link
      href={PARTNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full leading-none"
    >
      <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
    </Link>
  );
}

export default function SideAds() {
  const pathname = usePathname();
  if (pathname?.includes("/admin")) return null;

  return (
    <>
      <section className="xl:hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {[...LEFT_ADS, ...RIGHT_ADS].map((ad) => (
            <AdCard
              key={ad.src}
              src={ad.src}
              alt={ad.alt}
            />
          ))}
        </div>
      </section>

      <aside className="fixed left-0 top-[16vh] z-40 hidden w-[clamp(8rem,10vw,11rem)] xl:block">
        <div className="space-y-4">
          {LEFT_ADS.map((ad) => (
            <AdCard key={ad.src} src={ad.src} alt={ad.alt} />
          ))}
        </div>
      </aside>

      <aside className="fixed right-0 top-[16vh] z-40 hidden w-[clamp(8rem,10vw,11rem)] xl:block">
        <div className="space-y-4">
          {RIGHT_ADS.map((ad) => (
            <AdCard key={ad.src} src={ad.src} alt={ad.alt} />
          ))}
        </div>
      </aside>
    </>
  );
}
