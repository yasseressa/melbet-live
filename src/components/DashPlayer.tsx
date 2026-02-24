"use client";

import { useEffect, useRef, useState } from "react";

type DashPlayerProps = {
  src: string;
  clearKeys?: Record<string, string>;
  autoPlay?: boolean;
};

export default function DashPlayer({ src, clearKeys, autoPlay = false }: DashPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let player: any = null;
    let cancelled = false;

    async function init() {
      const mod = await import("shaka-player/dist/shaka-player.compiled");
      const shaka = mod.default || mod;
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;
      player = new shaka.Player(video);
      if (clearKeys && Object.keys(clearKeys).length > 0) {
        player.configure({ drm: { clearKeys } });
      }
      await player.load(src);
    }

    init().catch((e) => {
      if (!cancelled) setError(e?.message || "Failed to load DASH stream.");
    });

    return () => {
      cancelled = true;
      if (player?.destroy) player.destroy();
    };
  }, [src, clearKeys]);

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        autoPlay={autoPlay}
        className="w-full h-auto max-h-[70vh] bg-black"
      />
      {error ? (
        <div className="p-3 text-xs text-red-300 bg-neutral-950/70">{error}</div>
      ) : null}
    </div>
  );
}
