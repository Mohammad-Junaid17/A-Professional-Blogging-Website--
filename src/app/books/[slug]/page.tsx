import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Book, Download, ExternalLink, Calendar, User, Globe, Tag } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

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
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <Link href="/books" className="text-primary hover:underline flex items-center gap-2 text-sm font-semibold">
          &larr; Back to Library
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
        <AdminEditButton id={book.id} type="books" />
        <div className="flex flex-col md:flex-row">
          {/* Cover Section */}
          <div className="md:w-1/3 bg-primary-light flex items-center justify-center min-h-[300px] md:min-h-full border-r border-border relative overflow-hidden">
            {book.cover_url ? (
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${book.cover_url})` }}
              />
            ) : (
              <div className="text-center p-12">
                <Book size={80} className="text-primary mx-auto mb-6" />
                <div className="bg-primary text-card px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block">
                  {book.category || "Book"}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              {book.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-primary" />
                <span className="font-medium text-foreground">{book.author}</span>
              </div>
              {book.language && (
                <div className="flex items-center gap-1.5">
                  <Globe size={16} className="text-primary" />
                  <span>{book.language}</span>
                </div>
              )}
              {book.category && (
                <div className="flex items-center gap-1.5">
                  <Tag size={16} className="text-primary" />
                  <span>{book.category}</span>
                </div>
              )}
              {book.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-primary" />
                  <span>{new Date(book.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
              <MarkdownRenderer content={book.description || "No description provided."} />
            </div>

            {book.pdf_url && (
              <div className="flex flex-wrap gap-4 mt-auto">
                <a 
                  href={book.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary text-card px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Download size={20} /> Download PDF
                </a>
                <a 
                  href={book.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-card border border-border text-foreground px-6 py-3 rounded-xl font-bold hover:bg-muted/5 transition-colors shadow-sm"
                >
                  <ExternalLink size={20} /> Read Online
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <CommentSection contentType="books" contentId={book.id} />
    </div>
  );
}
