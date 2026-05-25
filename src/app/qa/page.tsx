import Link from "next/link";
import { HelpCircle, ChevronRight, Search } from "lucide-react";
import { QACard } from "@/components/ui/QACard";
import { createClient } from "@/lib/supabase/server";
import SubmitQuestionButton from "@/components/SubmitQuestionButton";

// Categories are fetched dynamically

export default async function QAPage(props: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentCategory = searchParams.category || "All Categories";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("qa_entries").select("*").eq("status", "answered").order("created_at", { ascending: false });

  if (currentCategory !== "All Categories") {
    query = query.eq("category", currentCategory);
  }

  if (searchQuery) {
    query = query.ilike("question", `%${searchQuery}%`);
  }

  const { data: qaEntries } = await query;

  const { data: categoryData } = await supabase
    .from("categories")
    .select("name")
    .or("content_type.eq.qa,content_type.is.null")
    .order("name", { ascending: true });
  
  const fetchedCategories = categoryData?.map(c => c.name) || [];
  const CATEGORIES = ["All Categories", ...fetchedCategories];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar - 25% */}
      <aside className="w-full md:w-1/4 shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-muted mb-4 uppercase">Topics</h2>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <li key={cat}>
                <Link
                  href={`/qa?category=${cat === "All Categories" ? "" : cat}`}
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
      </aside>

      {/* Main Content - 75% */}
      <main className="w-full md:w-3/4">
        <div className="flex items-center text-sm text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-foreground font-medium">Q&A</span>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary">
              <HelpCircle size={20} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-foreground">Questions & Answers</h1>
          </div>
          <SubmitQuestionButton />
        </div>

        <form method="GET" action="/qa" className="relative mb-8">
          <input type="hidden" name="category" value={currentCategory === "All Categories" ? "" : currentCategory} />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <div className="space-y-6">
          {qaEntries && qaEntries.length > 0 ? (
            qaEntries.map((qa) => (
              <QACard key={qa.id} qa={qa} />
            ))
          ) : (
            <div className="py-12 text-center text-muted">
              No Q&A entries found for this category.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
