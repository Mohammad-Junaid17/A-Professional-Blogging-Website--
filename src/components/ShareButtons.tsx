"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export function ShareButtons({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      // Fallback: open a mailto or just copy
      await copyToClipboard(url);
    }
  }

  async function copyToClipboard(text?: string) {
    const url = text ?? window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Older browser fallback
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-card rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <Share2 size={16} />
        Share
      </button>

      <button
        onClick={() => copyToClipboard()}
        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all text-sm font-medium ${
          copied
            ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
            : "bg-card border-border text-foreground hover:bg-muted/10"
        }`}
      >
        {copied ? (
          <>
            <Check size={16} className="text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
