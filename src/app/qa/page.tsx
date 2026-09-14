import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";
import { QACard } from "@/components/ui/QACard";
import { CategoryFilterBar } from "@/components/ui/CategoryFilterBar";
import { createClient } from "@/lib/supabase/server";
import SubmitQuestionButton from "@/components/SubmitQuestionButton";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Islamic Q&A — Questions & Answers on Fiqh, Aqeedah & Sunnah",
  description: "Find answers to common questions about Islamic beliefs, rulings, and practices from qualified Sunni scholars of the Hanafi school.",
};

export default async function QAPage(props: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentCategory = searchParams.category || "";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("qa_entries").select("*").eq("status", "answered").order("created_at", { ascending: false });
  if (currentCategory) query = query.eq("category", currentCategory);
  if (searchQuery) query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`);
  const { data: qaEntries } = await query;

  const { data: categoryData } = await supabase.from("categories").select("name").or("content_type.eq.qa,content_type.is.null").order("name", { ascending: true });
  const CATEGORIES = categoryData?.map((c) => c.name) || [];

  const { data: countData } = await supabase.from("qa_entries").select("category").eq("status", "answered");
  const countMap: Record<string, number> = {};
  countData?.forEach((r) => { if (r.category) countMap[r.category] = (countMap[r.category] || 0) + 1; });
  const CATEGORY_COUNTS = CATEGORIES.map((name) => ({ name, count: countMap[name] || 0 }));

  const { data: titleData } = await supabase.from("qa_entries").select("question").eq("status", "answered").limit(200);
  const TITLES = titleData?.map((t) => t.question).filter(Boolean) as string[] || [];

  const resultCount = qaEntries?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Q&A</span>
      </div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary"><HelpCircle size={20} /></div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Questions & Answers</h1>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <AdminAddButton type="qa" label="Add Q&A" />
          <SubmitQuestionButton />
        </div>
      </div>
      <Suspense>
        <CategoryFilterBar
          categories={CATEGORIES}
          categoryCounts={CATEGORY_COUNTS}
          allCategoryLabel="All Topics"
          paramName="category"
          searchPlaceholder="Search questions by keyword..."
          resultCount={resultCount}
          visibleCount={8}
          basePath="/qa"
          section="qa"
          autocompleteItems={TITLES}
        />
      </Suspense>
      <div className="space-y-6">
        {qaEntries && qaEntries.length > 0 ? qaEntries.map((qa) => <QACard key={qa.id} qa={qa} />) : (
          <div className="py-16 text-center">
            <p className="text-muted text-lg mb-2">No questions found</p>
            <p className="text-muted/60 text-sm">Try adjusting your search or selecting a different topic.</p>
          </div>
        )}
      </div>
    </div>
  );
}
