"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track actual page views, not API routes or static files
    if (pathname && !pathname.startsWith("/api/") && !pathname.startsWith("/_next/")) {
      // Send a silent background request to log the view
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => {
        // Silently fail if tracker is blocked by an adblocker or network error
      });
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
