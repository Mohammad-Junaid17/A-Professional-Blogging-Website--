import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Book, Download, ExternalLink, Calendar, User, Globe, Tag } from "lucide-react";
import Link from "next/link";
import { TranslationWrapper } from "@/components/TranslationWrapper";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import SaveButton from "@/components/SaveButton";

export const revalidate = 60; // revalidate every 60 seconds

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <AdminEditButton id={book.id} type="books" />
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-1">&rsaquo;</span>
        <Link href="/books" className="hover:text-primary transition-colors">Books</Link>
        <span className="mx-1">&rsaquo;</span>
        <span className="text-foreground font-medium truncate">Book Details</span>
      </div>

      {/* Header Metadata */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          {book.category && (
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {book.category}
            </span>
          )}
          {book.language && (
            <span className="inline-block bg-muted/10 text-muted text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {book.language}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-6">
          {book.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted border-b border-border pb-6">
          {book.author && (
            <div className="flex items-center gap-1.5">
              <User size={16} />
              <span className="font-medium text-foreground">Author: {book.author}</span>
            </div>
          )}
          {book.author && <span>|</span>}
          {book.created_at && (
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-primary" />
              <span>{new Date(book.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content matching Articles theme */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-16 font-serif leading-relaxed text-foreground/90 flex flex-col md:flex-row gap-8">
        {book.cover_url && (
          <div className="md:w-1/3 shrink-0">
            <img src={book.cover_url} alt={book.title} className="w-full h-auto rounded-lg shadow-md border border-border" />
          </div>
        )}
        <div className="md:w-2/3">
          <h2 className="font-bold text-3xl font-serif text-foreground mb-4">Description</h2>
          <TranslationWrapper 
            originalContent={book.description || "No description provided."}
            contentType="books"
            contentId={book.id}
          />
        </div>
      </div>

      {/* Footer / Downloads */}
      <footer className="border-t border-border pt-8 mt-12 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Actions</h3>
          <div className="flex flex-wrap items-center gap-4">
            <SaveButton contentType="book" contentId={book.id} />
            {book.pdf_url && (
              <>
                <a 
                  href={book.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary text-card px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm text-sm"
                >
                  <Download size={16} /> Download PDF
                </a>
                <a 
                  href={book.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-card border border-border text-foreground px-6 py-2 rounded-xl font-bold hover:bg-muted/5 transition-colors shadow-sm text-sm"
                >
                  <ExternalLink size={16} /> Read Online
                </a>
              </>
            )}
          </div>
        </div>
      </footer>

      <CommentSection contentType="books" contentId={book.id} />
    </div>
  );
}
