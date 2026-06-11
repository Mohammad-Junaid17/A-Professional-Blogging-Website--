import Link from "next/link";
import { FileText, Search, ChevronRight } from "lucide-react";
import { ArticleCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Islamic Articles & Essays — Aqeedah, Fiqh, Sunnah",
  description:
    "Explore in-depth articles on Islamic theology (Aqeedah), jurisprudence (Fiqh), prophetic traditions, and contemporary matters from the Sunni scholarly tradition of Ahl as-Sunnah.",
};

// Categories are fetched dynamically

export default async function ArticlesPage(props: {
  searchParams: Promise<{ category?: string; sub?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentCategory = searchParams.category || "All Articles";
  const currentSub = searchParams.sub || "";
  const searchQuery = searchParams.q || "";

  let query = supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (currentCategory !== "All Articles") {
    query = query.eq("category", currentCategory);
  }

  if (currentSub) {
    query = query.eq("sub_category", currentSub);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: articles } = await query;

  const { data: categoryData } = await supabase
    .from("categories")
    .select("name")
    .or("content_type.eq.articles,content_type.is.null")
    .order("name", { ascending: true });

  const fetchedCategories = categoryData?.map((c) => c.name) || [];
  const CATEGORIES = ["All Articles", ...fetchedCategories];

  // Fetch dynamic sub-categories for the current category
  let dynamicSubCats: string[] = [];
  if (currentCategory !== "All Articles") {
    const { data: subCatData } = await supabase
      .from("articles")
      .select("sub_category")
      .eq("category", currentCategory)
      .not("sub_category", "is", null);

    if (subCatData) {
      // Extract unique non-null sub_categories
      const uniqueSubs = new Set(subCatData.map((item) => item.sub_category).filter(Boolean));
      dynamicSubCats = Array.from(uniqueSubs).sort() as string[];
    }
  }
  const hasSubCats = dynamicSubCats.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar - 25% */}
      <aside className="w-full md:w-1/4 shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-muted mb-4 uppercase">
          Categories
        </h2>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat && !currentSub;
            return (
              <li key={cat}>
                <Link
                  href={`/articles?category=${cat === "All Articles" ? "" : encodeURIComponent(cat)}`}
                  className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-card font-semibold"
                      : "text-muted hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  {cat}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sub-topic chips — dynamic for any category with subcategories */}
        {hasSubCats && (
          <div className="mt-6">
            <h3 className="text-xs font-bold tracking-widest text-muted mb-3 uppercase">
              Sub-Topics
            </h3>
            <div className="flex flex-col gap-1">
              <Link
                href={`/articles?category=${encodeURIComponent(currentCategory)}`}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  !currentSub
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted hover:text-foreground hover:bg-muted/10"
                }`}
              >
                All {currentCategory}
              </Link>
              {dynamicSubCats.map((sub) => (
                <Link
                  key={sub}
                  href={`/articles?category=${encodeURIComponent(currentCategory)}&sub=${encodeURIComponent(sub)}`}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    currentSub === sub
                      ? "bg-primary text-card font-semibold"
                      : "text-muted hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content - 75% */}
      <main className="w-full md:w-3/4">
        <div className="flex items-center text-sm text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="mx-1" />
          {currentCategory !== "All Articles" ? (
            <>
              <Link
                href={`/articles`}
                className="hover:text-primary transition-colors"
              >
                Articles
              </Link>
              <ChevronRight size={14} className="mx-1" />
              <span className="text-foreground font-medium">{currentCategory}</span>
              {currentSub && (
                <>
                  <ChevronRight size={14} className="mx-1" />
                  <span className="text-foreground font-medium">{currentSub}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-foreground font-medium">Articles</span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4 w-full">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif text-foreground">
              {currentSub || (currentCategory === "All Articles" ? "Islamic Articles & Essays" : currentCategory)}
            </h1>
            {currentCategory !== "All Articles" && currentSub && (
              <p className="text-sm text-muted mt-0.5">
                {currentCategory} &rsaquo; {currentSub}
              </p>
            )}
          </div>
          <AdminAddButton type="articles" label="Add Article" />
        </div>

        {/* Sub-topic pill row (shown in main area when category has subcategories) */}
        {hasSubCats && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href={`/articles?category=${encodeURIComponent(currentCategory)}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                !currentSub
                  ? "bg-primary text-card"
                  : "bg-muted/10 text-muted hover:bg-primary/10 hover:text-primary"
              }`}
            >
              All
            </Link>
            {dynamicSubCats.map((sub) => (
              <Link
                key={sub}
                href={`/articles?category=${encodeURIComponent(currentCategory)}&sub=${encodeURIComponent(sub)}`}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  currentSub === sub
                    ? "bg-primary text-card"
                    : "bg-muted/10 text-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {sub}
              </Link>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <form method="GET" action="/articles" className="relative mb-8">
          <input
            type="hidden"
            name="category"
            value={currentCategory === "All Articles" ? "" : currentCategory}
          />
          {currentSub && <input type="hidden" name="sub" value={currentSub} />}
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={20}
          />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Article List */}
        <div className="space-y-4">
          {articles && articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="py-12 text-center text-muted">
              No articles found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
