"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function StickyMobileCTA() {
  const pathname = usePathname();
  
  // Hide on admin routes, auth routes, and the QA page itself (where they already have a big button)
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname === "/qa") {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link 
        href="/qa" 
        className="flex items-center gap-2 bg-primary text-card px-5 py-3.5 rounded-full shadow-lg font-bold text-sm hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
      >
        <HelpCircle size={20} />
        <span>Ask a Question</span>
      </Link>
    </div>
  );
}
