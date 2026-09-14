import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { ScholarCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import { CategoryFilterBar } from "@/components/ui/CategoryFilterBar";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sunni Scholar Biographies — Hanafi, Shafi'i, Maliki Scholars",
  description: "Read biographies of renowned Sunni scholars, muftis, and jurists from across the Islamic world including Imam Ahmad Raza Khan and the Ahl as-Sunnah tradition.",
};

const MADHABS = ["Hanafi", "Maliki", "Shafi'i", "Hanbali"];

export default async function ScholarsPage(props: { searchParams: Promise<{ madhab?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentMadhab = searchParams.madhab || "";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("scholars").select("*").eq("status", "published").order("name_english", { ascending: true });
  if (currentMadhab) query = query.ilike("madhab", `%${currentMadhab}%`);
  if (searchQuery) query = query.ilike("name_english", `%${searchQuery}%`);
  const { data: scholars } = await query;

  const { data: countData } = await supabase.from("scholars").select("madhab").eq("status", "published");
  const countMap: Record<string, number> = {};
  countData?.forEach((r) => { if (r.madhab) { const m = MADHABS.find((md) => r.madhab.toLowerCase().includes(md.toLowerCase())); if (m) countMap[m] = (countMap[m] || 0) + 1; } });
  const MADHAB_COUNTS = MADHABS.map((name) => ({ name, count: countMap[name] || 0 }));

  const { data: nameData } = await supabase.from("scholars").select("name_english").eq("status", "published").limit(200);
  const NAMES = nameData?.map((n) => n.name_english).filter(Boolean) as string[] || [];

  const resultCount = scholars?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Scholars</span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary"><Users size={20} /></div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Scholar Biographies</h1>
        <AdminAddButton type="scholars" label="Add Scholar" />
      </div>
      <Suspense>
        <CategoryFilterBar
          categories={MADHABS}
          categoryCounts={MADHAB_COUNTS}
          allCategoryLabel="All Madhabs"
          paramName="madhab"
          searchPlaceholder="Search scholars by name..."
          resultCount={resultCount}
          visibleCount={8}
          basePath="/scholars"
          section="scholars"
          autocompleteItems={NAMES}
        />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholars && scholars.length > 0 ? scholars.map((scholar) => <ScholarCard key={scholar.id} scholar={scholar} />) : (
          <div className="col-span-full py-16 text-center">
            <p className="text-muted text-lg mb-2">No scholars found</p>
            <p className="text-muted/60 text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
