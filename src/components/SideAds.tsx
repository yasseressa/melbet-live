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
  fillSlot = false,
}: {
  src: string;
  alt: string;
  fillSlot?: boolean;
}) {
  return (
    <Link
      href={PARTNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full leading-none ${fillSlot ? "h-full" : ""}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`block w-full ${fillSlot ? "h-full object-contain object-center bg-neutral-900" : "h-auto"}`}
      />
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

      <aside className="fixed left-0 top-[max(16vh,8rem)] bottom-0 z-40 hidden w-44 xl:block">
        <div className="flex h-full flex-col divide-y divide-neutral-700">
          {LEFT_ADS.map((ad) => (
            <div key={ad.src} className="min-h-0 flex-1">
              <AdCard src={ad.src} alt={ad.alt} fillSlot />
            </div>
          ))}
        </div>
      </aside>

      <aside className="fixed right-0 top-[max(16vh,8rem)] bottom-0 z-40 hidden w-44 xl:block">
        <div className="flex h-full flex-col divide-y divide-neutral-700">
          {RIGHT_ADS.map((ad) => (
            <div key={ad.src} className="min-h-0 flex-1">
              <AdCard src={ad.src} alt={ad.alt} fillSlot />
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
