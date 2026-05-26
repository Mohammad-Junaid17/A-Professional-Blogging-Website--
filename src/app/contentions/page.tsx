import Link from "next/link";
import { ShieldAlert, ChevronRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminAddButton } from "@/components/admin/AdminAddButton";

export const revalidate = 60;

export default async function ContentionsPage() {
  const supabase = await createClient();
  const { data: contentions } = await supabase.from("contentions").select("*").eq("status", "published").order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Contentions</span>
      </div>

      <div className="flex items-center gap-3 mb-10 w-full">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Contentions & Rebuttals</h1>
          <p className="text-muted mt-1">Common misconceptions and scholarly responses.</p>
        </div>
        <AdminAddButton type="contentions" label="Add Contention" />
      </div>

      <div className="space-y-10">
        {contentions && contentions.length > 0 ? (
          contentions.map((contention) => (
            <div key={contention.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative group">
              <AdminEditButton id={contention.id} type="contentions" />
              
              {/* Claim */}
              <div className="bg-red-50 dark:bg-red-950/20 p-6 border-b border-red-100 dark:border-red-900/30">
                <span className="text-xs font-bold tracking-widest uppercase text-red-600 dark:text-red-400 mb-2 block">
                  The Claim / Contention
                </span>
                <h3 className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
                  &quot;{contention.claim}&quot;
                </h3>
              </div>

              {/* Evidence Against */}
              <div className="bg-primary-light/30 p-6 border-b border-border">
                <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">
                  Evidence Against
                </span>
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                  <MarkdownRenderer content={contention.rebuttal} />
                </div>
              </div>

              {/* Scholarly Response */}
              {contention.scholarly_response && (
                <div className="p-6">
                  <span className="text-xs font-bold tracking-widest uppercase text-muted mb-3 block">
                    Scholarly Detailed Response
                  </span>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted leading-relaxed mb-6">
                    <MarkdownRenderer content={contention.scholarly_response} />
                  </div>
                  
                  {(contention.scholar || contention.source) && (
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground pt-4 border-t border-border/50">
                      {contention.scholar && <span>— {contention.scholar}</span>}
                      {contention.source && (
                        <span className="flex items-center gap-1 text-muted">
                          <BookOpen size={14} /> {contention.source}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted">
            No contentions found.
          </div>
        )}
      </div>
    </div>
  );
}
