"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TARGET_URL = "https://refpa3665.com/L?tag=d_4974371m_2170c_DAN222";
const MAX_REDIRECTS_PER_SESSION = 1;
const REDIRECT_COUNT_KEY = "melbet_global_redirect_count";
const REDIRECT_SESSION_START_KEY = "melbet_global_redirect_session_start";
const SESSION_TTL_MS = 60 * 1000;

export default function GlobalClickRedirect() {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin");

  useEffect(() => {
    if (isAdminPath) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const now = Date.now();
      const rawSessionStart = window.sessionStorage.getItem(REDIRECT_SESSION_START_KEY);
      const sessionStart = rawSessionStart ? Number(rawSessionStart) : 0;
      const sessionExpired = !Number.isFinite(sessionStart) || sessionStart <= 0 || now - sessionStart >= SESSION_TTL_MS;
      if (sessionExpired) {
        window.sessionStorage.setItem(REDIRECT_SESSION_START_KEY, String(now));
        window.sessionStorage.setItem(REDIRECT_COUNT_KEY, "0");
      }

      const rawCount = window.sessionStorage.getItem(REDIRECT_COUNT_KEY);
      const count = rawCount ? Number(rawCount) : 0;
      if (!Number.isFinite(count) || count >= MAX_REDIRECTS_PER_SESSION) return;

      event.preventDefault();
      window.sessionStorage.setItem(REDIRECT_COUNT_KEY, String(count + 1));
      window.open(TARGET_URL, "_blank", "noopener,noreferrer");
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [isAdminPath]);

  return null;
}
