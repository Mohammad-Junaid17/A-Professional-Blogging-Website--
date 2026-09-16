"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Languages, CheckCircle, Minus, Plus, Pencil, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface TranslationWrapperProps {
  originalContent: string;
  contentType: "article" | "qa" | "contentions" | "scholars" | "books";
  contentId: string;
  editHref?: string; // optional — only passed when user is admin
}

export function TranslationWrapper({
  originalContent,
  contentType,
  contentId,
  editHref,
}: TranslationWrapperProps) {
  const [activeLang, setActiveLang] = useState<string>("en");
  const [fontSize, setFontSize] = useState<number>(16);
  const [translations, setTranslations] = useState<any[]>([]);
  const [requestedLanguages, setRequestedLanguages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const LANGUAGES = [
    { code: "urdu", label: "Urdu", displayLabel: "اردو" },
  ];

  useEffect(() => {
    async function loadTranslations() {
      const { data } = await supabase
        .from("translations")
        .select("*")
        .eq("content_type", contentType)
        .eq("content_id", contentId);
      
      if (data) setTranslations(data);
      setLoading(false);
    }
    loadTranslations();
  }, [contentType, contentId]);

  const handleRequest = async (langCode: string) => {
    setRequestedLanguages((prev) => new Set(prev).add(langCode));
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    await supabase.from("translation_requests").insert({
      content_type: contentType,
      content_id: contentId,
      language: langCode,
      user_id: userId,
    });
  };

  if (loading) {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none mb-16 font-serif leading-relaxed text-foreground/90 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
        <div className="h-4 bg-muted rounded w-full mb-4"></div>
        <div className="h-4 bg-muted rounded w-full mb-4"></div>
        <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
      </div>
    );
  }

  return (
    <div>
      {/*
        Sticky reading-controls bar.
        sticky top-16  → docks directly below the h-16 navbar (z-50)
        z-40           → above article text, below navbar & modals
        -mx-4 px-4     → negative margin bleeds to container edges so bg covers full width
        backdrop-blur  → frosted glass effect while scrolling
      */}
      <div className="sticky top-16 z-40 -mx-4 px-4 bg-background border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-center py-2.5 gap-6 max-w-4xl mx-auto">
          
          {/* Back Button */}
          <Link
            href={contentType === 'article' ? '/articles' : `/${contentType}`}
            className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">
              {contentType === 'article' ? 'Articles' : 
               contentType === 'qa' ? 'Q&A' : 
               contentType === 'scholars' ? 'Scholars' : 
               contentType === 'books' ? 'Books' : 'Contentions'}
            </span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-6">
            {/* Admin Edit Button — only rendered when editHref is provided */}
          {editHref && (
            <Link
              href={editHref}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e2a] text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-all shadow-sm text-[12px] font-semibold"
              title="Edit this content"
            >
              <Pencil size={12} />
              Edit
            </Link>
          )}

          {/* Font Size Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
              disabled={fontSize <= 13}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e2a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a38] hover:text-black dark:hover:text-white disabled:opacity-40 transition-all shadow-sm"
              aria-label="Decrease font size"
            >
              <Minus size={13} />
            </button>
            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 min-w-[20px] text-center tabular-nums select-none">
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              disabled={fontSize >= 24}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e2a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a38] hover:text-black dark:hover:text-white disabled:opacity-40 transition-all shadow-sm"
              aria-label="Increase font size"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Language Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-[#2A2A38] border border-gray-200 dark:border-gray-700 p-[3px] rounded-full shadow-sm">
            <button
              onClick={() => setActiveLang("en")}
              className={`px-4 py-1 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                activeLang === "en"
                  ? "bg-white dark:bg-[#31373D] text-black dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              En
            </button>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-4 py-1 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                  activeLang === lang.code
                    ? "bg-white dark:bg-[#31373D] text-black dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <span className={lang.code === "urdu" ? "font-urdu text-[14px]" : ""}>
                  {lang.displayLabel}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>

    {/* Content — pt-6 provides spacing below the sticky bar */}
      <div className="mb-16 pt-6" dir={activeLang === "urdu" ? "rtl" : "ltr"}>
        {activeLang === "en" ? (
          <MarkdownRenderer
            content={originalContent}
            className="font-lora"
            style={{ fontSize: `${fontSize}px` }}
          />
        ) : translations.find((t) => t.language === activeLang)?.content ? (
          <MarkdownRenderer
            content={translations.find((t) => t.language === activeLang)!.content}
            className="font-lora"
            style={{ fontSize: `${fontSize}px` }}
          />
        ) : (
          <div className="py-16 px-6 text-center border border-dashed border-border rounded-xl bg-muted/10 my-8">
            <Languages size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-serif mb-2 text-foreground">Translation Not Available</h3>
            <p className="text-muted mb-6">
              The {LANGUAGES.find(l => l.code === activeLang)?.label} translation for this content has not been added yet.
            </p>
            <button
              onClick={() => handleRequest(activeLang)}
              disabled={requestedLanguages.has(activeLang)}
              className="inline-flex items-center gap-2 bg-primary text-card px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestedLanguages.has(activeLang) ? (
                <>
                  <CheckCircle size={18} />
                  Requested
                </>
              ) : (
                `Request Translation`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
