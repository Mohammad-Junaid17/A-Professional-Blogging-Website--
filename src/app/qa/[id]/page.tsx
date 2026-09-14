import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TranslationWrapper } from "@/components/TranslationWrapper";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { verifyAdmin } from "@/lib/auth-helpers";
import { ShareButtons } from "@/components/ShareButtons";
import SaveButton from "@/components/SaveButton";

export const revalidate = 60; // revalidate every 60 seconds

export default async function QADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSession = await verifyAdmin();
  const { data: qa } = await supabase
    .from("qa_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!qa || qa.status !== "answered") {
    notFound();
  }

  if (qa.redirect_url) {
    redirect(qa.redirect_url);
  }

  // Fetch related Q&As based on category/sub_category
  let relatedQAs: any[] = [];
  let query = supabase
    .from("qa_entries")
    .select("id, question, category, sub_category")
    .eq("status", "answered")
    .neq("id", qa.id)
    .limit(6);

  if (qa.sub_category) {
    query = query.eq("sub_category", qa.sub_category);
  } else if (qa.category) {
    query = query.eq("category", qa.category);
  }

  const { data: byCat } = await query;
  if (byCat) relatedQAs = byCat;

  // If not enough related by sub_category, fetch more from parent category
  if (relatedQAs.length < 6 && qa.sub_category && qa.category) {
    const { data: moreCat } = await supabase
      .from("qa_entries")
      .select("id, question, category, sub_category")
      .eq("category", qa.category)
      .eq("status", "answered")
      .neq("id", qa.id)
      .not("id", "in", `(${relatedQAs.map(q => q.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
      .limit(6 - relatedQAs.length);
      
    if (moreCat) {
      relatedQAs = [...relatedQAs, ...moreCat];
    }
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
        
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-foreground mt-8 mb-6 leading-tight">
          {qa.title || qa.question}
        </h1>
        
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

      <div className="mb-16">
        <TranslationWrapper 
          originalContent={`## Question\n\n${qa.question}\n\n## Answer\n\n${qa.admin_answer || qa.answer || "No answer provided yet."}`}
          contentType="qa"
          contentId={qa.id}
          editHref={adminSession ? `/admin/qa/${qa.id}/edit?returnUrl=/qa/${qa.id}` : undefined}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-8 mt-12 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Share or Save this Q&A</h3>
          <div className="flex flex-wrap items-center gap-3">
            <SaveButton contentType="qa" contentId={qa.id} />
            <ShareButtons 
              title={qa.title || qa.question} 
              text={`${qa.title || qa.question}\n\nA scholarly query answered by ${qa.answered_by || "Islam360"}\n\nRead now at:`}
            />
          </div>
        </div>

        {/* ── Related Q&As ── */}
        {relatedQAs.length > 0 && (
          <div className="mt-12">
            <div className="flex items-baseline gap-3 mb-6 border-b border-border pb-3">
              <h3 className="font-bold text-2xl font-serif">Related Q&As</h3>
              {qa.sub_category && (
                <span className="text-xs font-bold tracking-widest uppercase text-primary bg-primary-light px-2 py-0.5 rounded-full">
                  {qa.sub_category}
                </span>
              )}
            </div>
            <ul className="space-y-3">
              {relatedQAs.map((related) => (
                <li key={related.id} className="flex items-start gap-3 group">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                  <Link
                    href={`/qa/${related.id}`}
                    className="text-foreground hover:text-primary transition-colors text-base font-medium leading-snug"
                  >
                    {related.question}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href={`/qa?category=${encodeURIComponent(qa.category || "")}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                View all {qa.category} Q&As →
              </Link>
            </div>
          </div>
        )}
      </footer>

      {/* Comments */}
      <CommentSection contentType="qa" contentId={qa.id} />
    </div>
  );
}
