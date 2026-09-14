import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, BookOpen, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { TranslationWrapper } from "@/components/TranslationWrapper";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { ShareButtons } from "@/components/ShareButtons";
import type { Metadata } from "next";

export const revalidate = 60; // revalidate every 60 seconds

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient();
  const { data: contention } = await supabase
    .from("contentions")
    .select("claim, rebuttal")
    .eq("id", params.id)
    .single();

  if (!contention) {
    return { title: "Contention Not Found" };
  }

  return {
    title: `Contention: ${contention.claim} | Islam360`,
    description: contention.rebuttal.substring(0, 160).replace(/[#_*\[\]]/g, ""),
  };
}

export default async function ContentionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contention } = await supabase
    .from("contentions")
    .select("*")
    .eq("id", id)
    .single();

  if (!contention || contention.status !== "published") {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <AdminEditButton id={contention.id} type="contentions" returnUrl={`/contentions/${contention.id}`} />
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href="/contentions" className="hover:text-primary transition-colors">Contentions</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium truncate">Details</span>
      </div>

      {/* Header Metadata */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            <ShieldAlert size={14} /> Contention & Rebuttal
          </span>
        </div>
        
        {/* Main Title / Claim */}
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground mt-4 mb-6 leading-tight">
          &quot;{contention.claim}&quot;
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted border-b border-border pb-6">
          {contention.scholar && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Scholar: {contention.scholar}</span>
            </div>
          )}
          {contention.scholar && contention.source && <span>|</span>}
          {contention.source && (
            <div className="flex items-center gap-1.5">
              <BookOpen size={16} className="text-primary" />
              <span>Source: {contention.source}</span>
            </div>
          )}
        </div>
      </header>

      <TranslationWrapper 
        originalContent={`## Rebuttal\n\n${contention.rebuttal}${contention.scholarly_response ? `\n\n---\n\n## Scholarly Response\n\n${contention.scholarly_response}` : ""}`}
        contentType="contentions"
        contentId={contention.id}
      />

      {/* Footer */}
      <footer className="border-t border-border pt-8 mt-12 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Share or Save this Rebuttal</h3>
          <div className="flex flex-wrap items-center gap-3">
            <ShareButtons 
              title={contention.claim} 
              text={`Contention: "${contention.claim}"\n\nRead the scholarly rebuttal at:`}
            />
          </div>
        </div>
      </footer>

      {/* Comments */}
      <CommentSection contentType="contentions" contentId={contention.id} />
    </div>
  );
}
