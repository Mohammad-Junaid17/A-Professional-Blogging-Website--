import Link from "next/link";
import { ShieldAlert, ChevronRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import { CategoryFilterBar } from "@/components/ui/CategoryFilterBar";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Islamic Contentions & Rebuttals — Misconceptions Addressed",
  description:
    "Scholarly responses to common misconceptions, contentions, and attacks against Sunni Islam with evidence-based rebuttals from qualified scholars.",
};

export const revalidate = 60;

export default async function ContentionsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const searchQuery = searchParams.q || "";

  let query = supabase.from("contentions").select("*").eq("status", "published").order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("claim", `%${searchQuery}%`);
  }

  const { data: contentions } = await query;
  const resultCount = contentions?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Contentions</span>
      </div>

      <div className="flex items-center gap-3 mb-6 w-full">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Contentions & Rebuttals</h1>
          <p className="text-muted mt-1">Common misconceptions and scholarly responses.</p>
        </div>
        <AdminAddButton type="contentions" label="Add Contention" />
      </div>

      <Suspense>
        <CategoryFilterBar
          categories={[]}
          allCategoryLabel="All Contentions"
          searchPlaceholder="Search contentions by keyword..."
          resultCount={resultCount}
          basePath="/contentions"
          section="contentions"
        />
      </Suspense>

      <div className="space-y-10">
        {contentions && contentions.length > 0 ? (
          contentions.map((contention) => (
            <div key={contention.id} className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow flex flex-col relative group">
              <AdminEditButton id={contention.id} type="contentions" />
              <span className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">Contention</span>
              <h3 className="font-bold text-[1.1rem] text-foreground mb-4 line-clamp-2">&quot;{contention.claim}&quot;</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted mb-4 flex-1">
                <p className="font-semibold text-foreground mb-1">Rebuttal:</p>
                <MarkdownRenderer content={contention.rebuttal} />
                {contention.scholarly_response && (
                  <div className="mt-4">
                    <p className="font-semibold text-foreground mb-1">Scholarly Response:</p>
                    <MarkdownRenderer content={contention.scholarly_response} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50">
                <span className="text-primary truncate max-w-[60%]">{contention.scholar || "Admin"}</span>
                <span className="truncate max-w-[40%] text-right">
                  {contention.source && <span className="flex items-center gap-1"><BookOpen size={14} /> {contention.source}</span>}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted text-lg mb-2">No contentions found</p>
            <p className="text-muted/60 text-sm">Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

