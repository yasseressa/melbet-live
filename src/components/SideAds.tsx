"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PARTNER_URL = "https://melbet.com/ar/slots/l?tag=d_4974371m_2170c_DAN222";

const LEFT_ADS = [
  { src: "/ads/game-1.jpg", alt: "Game 1 Ad" },
  { src: "/ads/game-4.jpg", alt: "Game 4 Ad" },
];

const RIGHT_ADS = [
  { src: "/ads/game-2.jpg", alt: "Game 2 Ad" },
  { src: "/ads/game-3.jpg", alt: "Game 3 Ad" },
];

function AdCard({
  src,
  alt,
  aspectClass = "aspect-[3/4]",
  sizes = "240px",
}: {
  src: string;
  alt: string;
  aspectClass?: string;
  sizes?: string;
}) {
  return (
    <Link
      href={PARTNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg"
    >
      <div className={`relative w-full ${aspectClass} bg-neutral-950`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </Link>
  );
}

export default function SideAds() {
  const pathname = usePathname();
  if (pathname?.includes("/admin")) return null;

  return (
    <>
      <section className="px-4 pb-4 xl:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2">
          {[...LEFT_ADS, ...RIGHT_ADS].map((ad) => (
            <AdCard
              key={ad.src}
              src={ad.src}
              alt={ad.alt}
              aspectClass="aspect-[16/9] sm:aspect-[21/9]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ))}
        </div>
      </section>

      <aside className="fixed left-3 top-[calc(16vh+3rem)] z-40 hidden w-32 2xl:w-44 xl:block">
        <div className="space-y-3">
          {LEFT_ADS.map((ad) => (
            <AdCard key={ad.src} src={ad.src} alt={ad.alt} sizes="(min-width: 1536px) 176px, 128px" />
          ))}
        </div>
      </aside>

      <aside className="fixed right-3 top-[calc(16vh+3rem)] z-40 hidden w-32 2xl:w-44 xl:block">
        <div className="space-y-3">
          {RIGHT_ADS.map((ad) => (
            <AdCard key={ad.src} src={ad.src} alt={ad.alt} sizes="(min-width: 1536px) 176px, 128px" />
          ))}
        </div>
      </aside>
    </>
  );
}
