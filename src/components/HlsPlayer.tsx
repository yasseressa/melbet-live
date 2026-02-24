"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
};

export default function HlsPlayer({ src, poster, autoPlay = true }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canNativeHls = useMemo(() => {
    const v = document.createElement("video");
    return v.canPlayType("application/vnd.apple.mpegurl") !== "";
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);

    // Native HLS (Safari / iOS)
    if (canNativeHls) {
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {});
      }
      return;
    }

    // Hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
        backBufferLength: 90,
      });

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        // Fatal errors -> show message; user can refresh or admin can check URL/CORS
        if (data?.fatal) {
          setError(data?.details || "Playback error");
          try { hls.destroy(); } catch {}
        }
      });

      return () => {
        try { hls.destroy(); } catch {}
      };
    }

    setError("HLS is not supported in this browser.");
  }, [src, autoPlay, canNativeHls]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black">
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay={autoPlay}
          poster={poster}
          className="w-full h-auto max-h-[70vh] bg-black"
        />
      </div>

      {error ? (
        <div className="text-sm text-red-300 border border-red-900/40 bg-red-950/30 rounded-2xl p-3">
          {error}
        </div>
      ) : (
        <div className="text-xs text-neutral-500">
          Tip: if playback fails, verify the URL is reachable, uses HTTPS, and allows CORS for your domain.
        </div>
      )}
    </div>
  );
}
