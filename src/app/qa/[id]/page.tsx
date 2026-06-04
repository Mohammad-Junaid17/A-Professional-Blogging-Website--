import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { ShareButtons } from "@/components/ShareButtons";
import SaveButton from "@/components/SaveButton";

export const revalidate = 60; // revalidate every 60 seconds

export default async function QADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: qa } = await supabase
    .from("qa_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!qa || qa.status !== "answered") {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <AdminEditButton id={qa.id} type="qa" returnUrl={`/qa/${qa.id}`} />
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href="/qa" className="hover:text-primary transition-colors">Q&A</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium truncate">Question Details</span>
      </div>

      {/* Header Metadata */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          {qa.category && (
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {qa.category}
            </span>
          )}
          {qa.sub_category && (
            <span className="inline-block bg-muted/10 text-muted text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {qa.sub_category}
            </span>
          )}
        </div>
        
        {/* We move the question text down into the body to match the image format */}
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted border-b border-border pb-6">
          {qa.answered_by && (
            <div className="flex items-center gap-1.5">
              <User size={16} />
              <span className="font-medium text-foreground">Answered by {qa.answered_by}</span>
            </div>
          )}
          {qa.answered_by && <span>|</span>}
          {qa.created_at && (
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-primary" />
              <span>{new Date(qa.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content matching Articles theme */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-16 font-serif leading-relaxed text-foreground/90">
        <h2 className="font-bold text-3xl font-serif text-foreground mb-4">Question</h2>
        <div className="mb-12">
          {qa.question}
        </div>

        <h2 className="font-bold text-3xl font-serif text-foreground mb-4 mt-8">Answer</h2>
        <MarkdownRenderer content={qa.admin_answer || qa.answer || "No answer provided yet."} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-8 mt-12 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Share or Save this Q&A</h3>
          <div className="flex flex-wrap items-center gap-3">
            <SaveButton contentType="qa" contentId={qa.id} />
            <ShareButtons title={qa.question} />
          </div>
        </div>
      </footer>

      {/* Comments */}
      <CommentSection contentType="qa" contentId={qa.id} />
    </div>
  );
}
