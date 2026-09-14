import { FileText, ChevronRight } from "lucide-react";
import { ArticleCard } from "@/components/ui/Cards";
import { CategoryFilterBar } from "@/components/ui/CategoryFilterBar";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Islamic Articles & Essays — Aqeedah, Fiqh, Sunnah",
  description:
    "Explore in-depth articles on Islamic theology (Aqeedah), jurisprudence (Fiqh), prophetic traditions, and contemporary matters from the Sunni scholarly tradition of Ahl as-Sunnah.",
};

export default async function ArticlesPage(props: {
  searchParams: Promise<{ category?: string; sub?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentCategory = searchParams.category || "";
  const currentSub = searchParams.sub || "";
  const searchQuery = searchParams.q || "";

  let query = supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (currentCategory) query = query.eq("category", currentCategory);
  if (currentSub) query = query.eq("sub_category", currentSub);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

  const { data: articles } = await query;

  // Categories
  const { data: categoryData } = await supabase
    .from("categories")
    .select("name")
    .or("content_type.eq.articles,content_type.is.null")
    .order("name", { ascending: true });
  const CATEGORIES = categoryData?.map((c) => c.name) || [];

  // Category counts (articles per category)
  const { data: countData } = await supabase
    .from("articles")
    .select("category")
    .eq("status", "published");
  const countMap: Record<string, number> = {};
  countData?.forEach((r) => { if (r.category) countMap[r.category] = (countMap[r.category] || 0) + 1; });
  const CATEGORY_COUNTS = CATEGORIES.map((name) => ({ name, count: countMap[name] || 0 }));

  // Autocomplete: article titles for search suggestions
  const { data: titleData } = await supabase.from("articles").select("title").eq("status", "published").limit(200);
  const TITLES = titleData?.map((t) => t.title).filter(Boolean) as string[] || [];

  // Sub-categories for active category
  let dynamicSubCats: string[] = [];
  if (currentCategory) {
    const { data: subCatData } = await supabase
      .from("articles")
      .select("sub_category")
      .eq("category", currentCategory)
      .not("sub_category", "is", null);
    if (subCatData) {
      const uniqueSubs = new Set(subCatData.map((item) => item.sub_category).filter(Boolean));
      dynamicSubCats = Array.from(uniqueSubs).sort() as string[];
    }
  }

  const resultCount = articles?.length ?? 0;
  const displayTitle = currentSub || (currentCategory ? currentCategory : "Islamic Articles & Essays");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        {currentCategory ? (
          <>
            <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-foreground font-medium">{currentCategory}</span>
            {currentSub && (<><ChevronRight size={14} className="mx-1" /><span className="text-foreground font-medium">{currentSub}</span></>)}
          </>
        ) : (
          <span className="text-foreground font-medium">Articles</span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">{displayTitle}</h1>
          {currentCategory && currentSub && <p className="text-sm text-muted mt-0.5">{currentCategory} &rsaquo; {currentSub}</p>}
        </div>
        <AdminAddButton type="articles" label="Add Article" />
      </div>

      <Suspense>
        <CategoryFilterBar
          categories={CATEGORIES}
          categoryCounts={CATEGORY_COUNTS}
          allCategoryLabel="All Articles"
          paramName="category"
          searchPlaceholder="Search articles by keyword..."
          resultCount={resultCount}
          visibleCount={8}
          basePath="/articles"
          section="articles"
          autocompleteItems={TITLES}
        />
      </Suspense>

      {dynamicSubCats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href={`/articles?category=${encodeURIComponent(currentCategory)}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${!currentSub ? "bg-primary text-card border-primary" : "bg-card text-muted border-border hover:border-primary/50 hover:text-foreground"}`}>
            All
          </Link>
          {dynamicSubCats.map((sub) => (
            <Link key={sub} href={`/articles?category=${encodeURIComponent(currentCategory)}&sub=${encodeURIComponent(sub)}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${currentSub === sub ? "bg-primary text-card border-primary" : "bg-card text-muted border-border hover:border-primary/50 hover:text-foreground"}`}>
              {sub}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {articles && articles.length > 0 ? (
          articles.map((article) => <ArticleCard key={article.id} article={article} />)
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted text-lg mb-2">No articles found</p>
            <p className="text-muted/60 text-sm">Try adjusting your search or selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
