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

function AdCard({ src, alt }: { src: string; alt: string }) {
  return (
    <Link
      href={PARTNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg"
    >
      <Image
        src={src}
        alt={alt}
        width={300}
        height={200}
        className="h-auto w-full object-contain bg-neutral-950"
      />
    </Link>
  );
}

export default function SideAds() {
  const pathname = usePathname();
  if (pathname?.includes("/admin")) return null;

  return (
    <>
      <aside className="fixed left-4 top-[calc(16vh+3rem)] z-40 hidden w-36 xl:block">
        <div className="space-y-3">
          {LEFT_ADS.map((ad) => (
            <AdCard key={ad.src} src={ad.src} alt={ad.alt} />
          ))}
        </div>
      </aside>

      <aside className="fixed right-4 top-[calc(16vh+3rem)] z-40 hidden w-36 xl:block">
        <div className="space-y-3">
          {RIGHT_ADS.map((ad) => (
            <AdCard key={ad.src} src={ad.src} alt={ad.alt} />
          ))}
        </div>
      </aside>
    </>
  );
}
