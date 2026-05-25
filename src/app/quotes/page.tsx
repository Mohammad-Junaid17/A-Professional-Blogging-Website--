import Link from "next/link";
import { Quote as QuoteIcon, ChevronRight } from "lucide-react";
import { QuoteCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";

const SOURCES = [
  { label: "All", value: "" },
  { label: "Quran", value: "quran" },
  { label: "Hadith", value: "hadith" },
  { label: "Scholars", value: "scholar" }
];

export default async function QuotesPage(props: { searchParams: Promise<{ source?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentSource = searchParams.source || "";

  let query = supabase.from("quotes").select("*").order("created_at", { ascending: false });

  if (currentSource) {
    query = query.eq("source_type", currentSource);
  }

  const { data: quotes } = await query;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Quotes</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary">
            <QuoteIcon size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">Inspirational Quotes</h1>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end gap-2">
          {SOURCES.map((source) => {
            const isActive = currentSource === source.value;
            return (
              <Link
                key={source.label}
                href={`/quotes${source.value ? `?source=${source.value}` : ''}`}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes && quotes.length > 0 ? (
          quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted">
            No quotes found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
