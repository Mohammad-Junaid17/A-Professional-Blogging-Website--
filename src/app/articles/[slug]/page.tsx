import Link from "next/link";
import { ChevronRight, Clock, User, Share2, Copy, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { notFound } from "next/navigation";

import { AdminEditButton } from "@/components/admin/AdminEditButton";

export const revalidate = 60;

export default async function ArticlePage(props: { params: Promise<{ slug: string  }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!article) {
    notFound();
  }

  // Fetch related articles
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select("id, title, slug")
    .eq("category", article.category)
    .neq("id", article.id)
    .limit(3);

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl relative">
      <AdminEditButton id={article.id} type="articles" />
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium truncate">{article.title}</span>
      </div>

      <header className="mb-10 text-center">
        {article.category && (
          <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            {article.category}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-6">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
          {article.author && (
            <div className="flex items-center gap-1">
              <User size={16} />
              <span className="font-medium text-foreground">{article.author}</span>
            </div>
          )}
          <span>|</span>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{article.reading_time || 5} min read</span>
          </div>
          {article.created_at && (
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-primary" />
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
        <MarkdownRenderer content={article.content || article.excerpt || ""} />
      </div>

      {/* Footer / Share / Related */}
      <footer className="border-t border-border pt-8 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <h3 className="font-bold text-lg">Share this article</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-muted/10 text-foreground rounded-md hover:bg-muted/20 transition-colors text-sm font-medium">
              <Share2 size={16} /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-muted/10 transition-colors text-sm font-medium">
              <Copy size={16} /> Copy Link
            </button>
          </div>
        </div>

        {relatedArticles && relatedArticles.length > 0 && (
          <div>
            <h3 className="font-bold text-2xl font-serif mb-6 border-b border-border pb-2">Related Articles</h3>
            <ul className="space-y-3">
              {relatedArticles.map((related) => (
                <li key={related.id}>
                  <Link href={`/articles/${related.slug}`} className="text-primary hover:underline text-lg">
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </footer>

      {/* Comments */}
      <CommentSection contentType="article" contentId={article.id} />
    </article>
  );
}
