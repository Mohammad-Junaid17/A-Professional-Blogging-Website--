import Link from "next/link";
import { BookMarked, ChevronRight, BookOpen, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminAddButton } from "@/components/admin/AdminAddButton";

const SOURCES = [
  { label: "All", value: "" },
  { label: "Quran", value: "quran" },
  { label: "Hadith", value: "hadith" },
  { label: "Scholarly Consensus (Ijma)", value: "ijma" }
];

export default async function ProofsPage(props: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentFilter = searchParams.filter || "";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("proofs").select("*").eq("status", "published").order("created_at", { ascending: false });

  if (currentFilter) {
    query = query.eq("proof_type", currentFilter);
  }

  if (searchQuery) {
    query = query.or(`translation.ilike.%${searchQuery}%,arabic_text.ilike.%${searchQuery}%,source_reference.ilike.%${searchQuery}%`);
  }

  const { data: proofs } = await query;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Proofs & Evidences</span>
      </div>

      <div className="flex items-center gap-3 mb-8 w-full">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary">
          <BookMarked size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Proofs & Evidences</h1>
          <p className="text-muted mt-1">Foundational texts and established scholarly consensus.</p>
        </div>
        <AdminAddButton type="proofs" label="Add Proof" />
      </div>

      <div className="flex flex-wrap gap-2 mb-10 border-b border-border pb-6">
        {SOURCES.map((source) => {
          const isActive = currentFilter === source.value;
          return (
            <Link
              key={source.label}
              href={`/proofs${source.value ? `?filter=${source.value}` : ''}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-card"
                  : "bg-card border border-border text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              {source.label}
            </Link>
          );
        })}
      </div>

      <form method="GET" action="/proofs" className="relative mb-10">
        <input type="hidden" name="filter" value={currentFilter} />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search proofs by translation, source, or text..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      <div className="space-y-8">
        {proofs && proofs.length > 0 ? (
          proofs.map((proof) => {
            let badgeClass = "bg-primary text-card";
            let badgeText = "PROOF";
            
            if (proof.proof_type === "quran") {
              badgeClass = "bg-primary text-card";
              badgeText = "QURAN";
            } else if (proof.proof_type === "hadith") {
              badgeClass = "bg-[#C9A84C] text-white"; // Gold/Amber
              badgeText = "HADITH";
            } else if (proof.proof_type === "ijma") {
              badgeClass = "bg-blue-600 text-white"; // Blue
              badgeText = "IJMA";
            }

            return (
              <div key={proof.id} className="bg-card border border-border p-6 md:p-8 rounded-xl shadow-sm relative group">
                <AdminEditButton id={proof.id} type="proofs" />
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>

                {proof.arabic_text && (
                  <div className="bg-primary-light/50 p-6 rounded-lg mb-6 text-center border border-primary/20">
                    <p className="font-amiri text-2xl md:text-3xl text-primary leading-loose" dir="rtl">
                      {proof.arabic_text}
                    </p>
                  </div>
                )}

                {proof.transliteration && (
                  <p className="text-muted italic text-center mb-6 max-w-2xl mx-auto">
                    {proof.transliteration}
                  </p>
                )}

                <p className="text-foreground text-lg leading-relaxed mb-6">
                  {proof.translation}
                </p>

                {proof.source_reference && (
                  <div className="flex items-center gap-2 text-sm text-muted pt-4 border-t border-border/50">
                    <BookOpen size={16} />
                    <span>{proof.source_reference}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-muted">
            No proofs found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
