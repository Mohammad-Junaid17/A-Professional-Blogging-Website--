import Link from "next/link";
import { ChevronRight, Clock, User, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { notFound, redirect } from "next/navigation";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { ShareButtons } from "@/components/ShareButtons";
import SaveButton from "@/components/SaveButton";
import { ArticleSchema, BreadcrumbSchema } from "@/components/JsonLd";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, author, category")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) {
    return { title: "Article Not Found" };
  }

  const description =
    article.excerpt?.substring(0, 160) ||
    `Read "${article.title}" — an in-depth article on ${article.category || "Islamic sciences"} from the Sunni scholarly tradition.`;

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      authors: article.author ? [article.author] : undefined,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description,
    },
  };
}

// Ordered sub-topics for Aqā'id section
const AQAID_SUBTOPICS = [
  "Mawlid",
  "Knowledge of the Unseen",
  "Messenger of Allah",
  "Tawassul",
  "Deobandism",
  "Wahaabism",
  "Kissing of the Thumbs",
  "Miscellaneous",
  "Shi'a",
];

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!article) {
    notFound();
  }

  if (article.redirect_url) {
    redirect(article.redirect_url);
  }

  const isAqaid = article.category === "Aqā'id";
  let relatedArticles: { id: string; title: string; slug: string; sub_category: string | null }[] = [];
  
  try {
    // Import universal local mapping created by our scraper
    const relatedMap = (await import("@/data/all_related.json").then((m) => m.default || m)) as Record<string, string[]>;
    const mappedSlugs: string[] = relatedMap[params.slug] || [];
    
    if (mappedSlugs.length > 0) {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, sub_category")
        .in("slug", mappedSlugs)
        .eq("status", "published");
        
      if (data) {
        // Sort to match the exact order defined in the mapped array
        relatedArticles = data.sort(
          (a, b) => mappedSlugs.indexOf(a.slug) - mappedSlugs.indexOf(b.slug)
        );
      }
    }
  } catch (err) {
    console.error("Could not load all_related.json map", err);
  }

  // Fallback: If no related articles found in map, or if not Aqā'id
  if (relatedArticles.length === 0) {
    let query = supabase
      .from("articles")
      .select("id, title, slug, sub_category")
      .eq("status", "published")
      .neq("id", article.id)
      .limit(6);

    if (article.sub_category) {
      query = query.eq("sub_category", article.sub_category);
    } else {
      query = query.eq("category", article.category);
    }

    const { data: byCat } = await query;
    
    // If not enough related by sub_category, fetch more from parent category
    if (byCat && byCat.length < 6 && article.sub_category) {
      const { data: moreCat } = await supabase
        .from("articles")
        .select("id, title, slug, sub_category")
        .eq("category", article.category)
        .eq("status", "published")
        .neq("id", article.id)
        .not("id", "in", `(${byCat.map(a => a.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .limit(6 - byCat.length);
        
      relatedArticles = [...byCat, ...(moreCat || [])];
    } else {
      relatedArticles = byCat || [];
    }
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl relative">
      <ArticleSchema
        title={article.title}
        description={article.excerpt || article.content?.substring(0, 160) || ""}
        slug={params.slug}
        author={article.author}
        datePublished={article.created_at}
        dateModified={article.updated_at || article.created_at}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://islam360.ridawiway.com" },
          { name: "Articles", url: "https://islam360.ridawiway.com/articles" },
          { name: article.title, url: `https://islam360.ridawiway.com/articles/${params.slug}` },
        ]}
      />
      <AdminEditButton id={article.id} type="articles" returnUrl={`/articles?category=${encodeURIComponent(article.category)}`} />

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
        {isAqaid && (
          <>
            <ChevronRight size={14} className="mx-1" />
            <Link
              href={`/articles?category=${encodeURIComponent(article.category)}`}
              className="hover:text-primary transition-colors"
            >
              Aqā&apos;id
            </Link>
          </>
        )}
        {article.sub_category && (
          <>
            <ChevronRight size={14} className="mx-1" />
            <Link
              href={`/articles?category=${encodeURIComponent(article.category)}&sub=${encodeURIComponent(article.sub_category)}`}
              className="hover:text-primary transition-colors"
            >
              {article.sub_category}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium truncate">{article.title}</span>
      </div>

      {/* Article Header */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          {article.category && (
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {article.category}
            </span>
          )}
          {article.sub_category && (
            <span className="inline-block bg-muted/10 text-muted text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {article.sub_category}
            </span>
          )}
        </div>
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
      <div className="prose prose-lg dark:prose-invert max-w-none mb-16 font-serif leading-relaxed text-foreground/90">
        <MarkdownRenderer content={article.content || article.excerpt || ""} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-8 mt-12">
        {/* Share Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <h3 className="font-bold text-lg">Share or Save this article</h3>
          <div className="flex flex-wrap items-center gap-3">
            <SaveButton contentType="article" contentId={article.id} />
            <ShareButtons title={article.title} />
          </div>
        </div>

        {/* ── Related Articles (Common UI for both Aqaid mapped items and fallback) ── */}
        {relatedArticles.length > 0 && (
          <div>
            <div className="flex items-baseline gap-3 mb-6 border-b border-border pb-3">
              <h3 className="font-bold text-2xl font-serif">Related Articles</h3>
              {article.sub_category && !isAqaid && (
                <span className="text-xs font-bold tracking-widest uppercase text-primary bg-primary-light px-2 py-0.5 rounded-full">
                  {article.sub_category}
                </span>
              )}
            </div>
            <ul className="space-y-3">
              {relatedArticles.map((related) => (
                <li key={related.id} className="flex items-start gap-3 group">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                  <Link
                    href={`/articles/${related.slug}`}
                    className="text-foreground hover:text-primary transition-colors text-base font-medium leading-snug"
                  >
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href={`/articles?category=${encodeURIComponent(article.category)}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                View all {article.category} articles →
              </Link>
            </div>
          </div>
        )}
      </footer>

      {/* Comments */}
      <CommentSection contentType="article" contentId={article.id} />
    </article>
  );
}
