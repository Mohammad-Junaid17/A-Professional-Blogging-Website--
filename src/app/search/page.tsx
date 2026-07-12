/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Search, ChevronRight, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search across articles, books, scholars, Q&A, and lectures on Islam360.",
};

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const query = searchParams.q || "";

  const results: any[] = [];

  if (query) {
    // Search Articles
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, content, author")
      .ilike("title", `%${query}%`)
      .limit(10);
      
    // Search Books
    const { data: books } = await supabase
      .from("books")
      .select("id, title, slug, description, author")
      .ilike("title", `%${query}%`)
      .limit(10);

    // Search Scholars
    const { data: scholars } = await supabase
      .from("scholars")
      .select("id, name_english, slug, bio, madhab")
      .ilike("name_english", `%${query}%`)
      .limit(10);

    if (articles) {
      results.push(...articles.map(a => ({
        ...a,
        type: "ARTICLE",
        desc: a.excerpt || a.content?.substring(0, 150),
        subtitle: a.author,
        url: `/articles/${a.slug}`
      })));
    }
    
    if (books) {
      results.push(...books.map(b => ({
        ...b,
        type: "BOOK",
        desc: b.description,
        subtitle: b.author,
        url: `/books/${b.slug}`
      })));
    }
    
    if (scholars) {
      results.push(...scholars.map(s => ({
        ...s,
        title: s.name_english,
        type: "SCHOLAR",
        desc: s.bio?.substring(0, 150),
        subtitle: s.madhab,
        url: `/scholars/${s.slug}`
      })));
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh]">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Search</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary">
          <Search size={24} />
        </div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Search</h1>
      </div>

      <form method="GET" action="/search" className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={24} />
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search across articles, books, and scholars..."
          className="w-full pl-14 pr-4 py-4 bg-card border-2 border-border rounded-xl text-lg text-foreground focus:outline-none focus:border-primary transition-colors"
          autoFocus
        />
        <button type="submit" className="hidden">Search</button>
      </form>

      {query && (
        <div className="mb-6 border-b border-border pb-4">
          <p className="font-medium text-foreground">
            {results.length} result(s) found for &quot;{query}&quot;
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((item, idx) => {
          let badgeClass = "bg-primary text-card";
          if (item.type === "BOOK") badgeClass = "bg-[#C9A84C] text-white";
          if (item.type === "SCHOLAR") badgeClass = "bg-teal-600 text-white";

          return (
            <Link key={`${item.type}-${idx}`} href={item.url} className="block group">
              <div className="bg-card border border-border p-6 rounded-xl hover:shadow-md hover:border-primary/30 transition-all flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${badgeClass}`}>
                      {item.type}
                    </span>
                    {item.subtitle && (
                      <>
                        <span className="text-muted">|</span>
                        <span className="text-xs font-medium text-muted">{item.subtitle}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-primary group-hover:underline mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2">
                  <ArrowRight size={20} className="text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}

        {query && results.length === 0 && (
          <div className="text-center py-12 text-muted bg-card border border-border rounded-xl">
            <Search size={48} className="mx-auto text-muted/30 mb-4" />
            <p>No results found matching your search.</p>
            <p className="text-sm mt-2">Try different keywords or check your spelling.</p>
          </div>
        )}
      </div>
    </div>
  );
}
