"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for admin, API, and Next.js internal routes
    const isExcluded =
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/auth");

    if (!isExcluded) {
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
