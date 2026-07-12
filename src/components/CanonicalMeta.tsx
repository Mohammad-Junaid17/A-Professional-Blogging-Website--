"use client";

import { usePathname } from "next/navigation";

export function CanonicalMeta() {
  const pathname = usePathname() || "";
  const url = `https://islam360.ridawiway.com${pathname}`;
  
  return (
    <>
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
    </>
  );
}
