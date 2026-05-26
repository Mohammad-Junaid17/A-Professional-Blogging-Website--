import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

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
      <AdminEditButton id={qa.id} type="qa" />
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href="/qa" className="hover:text-primary transition-colors">Q&A</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium truncate">Question Details</span>
      </div>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-6">
          {qa.category && (
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {qa.category}
            </span>
          )}
          {qa.sub_category && (
            <span className="inline-block bg-border text-foreground text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {qa.sub_category}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-6">
          {qa.question}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted border-b border-border pb-6">
          {qa.answered_by && (
            <div className="flex items-center gap-1.5">
              <User size={16} className="text-primary" />
              <span className="font-medium text-foreground">Answered by: {qa.answered_by}</span>
            </div>
          )}
          
          {qa.created_at && (
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-primary" />
              <span>{new Date(qa.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-card border border-border p-8 rounded-2xl mb-16 shadow-sm">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={qa.admin_answer || qa.answer || "No answer provided yet."} />
        </div>
      </div>

      {/* Comments */}
      <CommentSection contentType="qa" contentId={qa.id} />
    </div>
  );
}
