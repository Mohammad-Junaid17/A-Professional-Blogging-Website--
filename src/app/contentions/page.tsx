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
          contentions.map((contention) => {
            const previewText = contention.rebuttal.replace(/[#_*\[\]`]/g, "").substring(0, 200) + (contention.rebuttal.length > 200 ? "..." : "");
            
            return (
            <div key={contention.id} className="relative w-full">
              <AdminEditButton id={contention.id} type="contentions" returnUrl="/contentions" />
              <Link href={`/contentions/${contention.id}`} className="block w-full h-full">
                <div className="bg-card border border-border p-6 rounded-xl hover:shadow-md hover:border-primary/30 transition-all flex flex-col relative group h-full">
                  <div className="flex items-center justify-between mb-3 pr-10">
                    <span className="bg-background px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-muted uppercase">
                      Contention & Rebuttal
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted group-hover:text-primary transition-colors">
                      <span>Read Full Response</span>
                      <ChevronRight size={14} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold font-serif text-[1.25rem] leading-snug text-foreground mb-3 group-hover:text-primary transition-colors">
                    &quot;{contention.claim}&quot;
                  </h3>
                  
                  <p className="text-muted text-sm line-clamp-3 mb-5 leading-relaxed flex-1">
                    {previewText}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted font-medium pt-4 border-t border-border/50 mt-auto">
                    <span className="text-primary truncate max-w-[60%]">
                      {contention.scholar || "Admin"}
                    </span>
                    <span className="truncate max-w-[40%] text-right">
                      {contention.source && (
                        <span className="flex items-center justify-end gap-1">
                          <BookOpen size={14} /> {contention.source}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )})
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

