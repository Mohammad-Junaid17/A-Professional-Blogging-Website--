"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Languages, ExternalLink, CheckCircle } from "lucide-react";

interface TranslationWrapperProps {
  originalContent: string;
  contentType: "article" | "qa";
  contentId: string;
}

export function TranslationWrapper({
  originalContent,
  contentType,
  contentId,
}: TranslationWrapperProps) {
  const [currentContent, setCurrentContent] = useState(originalContent);
  const [activeLang, setActiveLang] = useState<string>("en");
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

  const handleTranslate = (langCode: string) => {
    const translation = translations.find((t) => t.language === langCode);
    if (translation) {
      if (translation.external_link) {
        window.open(translation.external_link, "_blank");
      } else if (translation.content) {
        setCurrentContent(translation.content);
        setActiveLang(langCode);
      }
    }
  };

  const handleRevert = () => {
    setActiveLang("en");
  };

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
      <div className="absolute top-3 right-3 md:top-6 md:right-6 z-10">
        <div className="inline-flex items-center bg-gray-200/70 dark:bg-[#2A2A38] p-[3px] rounded-lg">
          <button
            onClick={() => setActiveLang("en")}
            className={`px-3 py-1 rounded-md text-[13px] font-semibold transition-all duration-200 ${
              activeLang === "en"
                ? "bg-white dark:bg-[#31373D] text-black dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            En
          </button>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              className={`px-3 py-1 rounded-md text-[13px] font-semibold transition-all duration-200 ${
                activeLang === lang.code
                  ? "bg-white dark:bg-[#31373D] text-black dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span className={lang.code === "urdu" ? "font-urdu text-[14px]" : ""}>
                {lang.displayLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none mb-16 font-serif leading-relaxed text-foreground/90">
        {activeLang === "en" ? (
          <MarkdownRenderer content={originalContent} />
        ) : translations.find((t) => t.language === activeLang)?.content ? (
          <MarkdownRenderer content={translations.find((t) => t.language === activeLang)!.content} />
        ) : (
          <div className="py-16 px-6 text-center border border-dashed border-border rounded-xl bg-muted/10 my-8">
            <Languages size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-serif mb-2">Translation Not Available</h3>
            <p className="text-muted-foreground mb-6">
              The {LANGUAGES.find(l => l.code === activeLang)?.label} translation for this content has not been added yet.
            </p>
            <button
              onClick={() => handleRequest(activeLang)}
              disabled={requestedLanguages.has(activeLang)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
