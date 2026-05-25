import Link from "next/link";
import { Users, Search, ChevronRight } from "lucide-react";
import { ScholarCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";

export default async function ScholarsPage(props: { searchParams: Promise<{ madhab?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentMadhab = searchParams.madhab || "All";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("scholars").select("*").order("name_english", { ascending: true });

  if (currentMadhab !== "All") {
    query = query.ilike("madhab", `%${currentMadhab}%`);
  }
  
  if (searchQuery) {
    query = query.ilike("name_english", `%${searchQuery}%`);
  }

  const { data: scholars } = await query;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Scholars</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary">
            <Users size={20} />
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Scholar Biographies</h1>
        </div>

        <form method="GET" action="/scholars" className="flex flex-col sm:flex-row gap-3">
          <select 
            name="madhab" 
            defaultValue={currentMadhab === "All" ? "" : currentMadhab}
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Madhabs</option>
            <option value="Hanafi">Hanafi</option>
            <option value="Maliki">Maliki</option>
            <option value="Shafi'i">Shafi&apos;i</option>
            <option value="Hanbali">Hanbali</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search scholars..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-card rounded-md font-medium hover:bg-primary/90 transition-colors">
            Filter
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholars && scholars.length > 0 ? (
          scholars.map((scholar) => (
            <ScholarCard key={scholar.id} scholar={scholar} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted">
            No scholars found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
