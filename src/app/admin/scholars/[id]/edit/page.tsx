"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditScholar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const supabase = createClient(); const router = useRouter();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name_english: "", name_arabic: "", slug: "", birth_year: "", death_year_ah: "", madhab: "", origin: "", bio: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from("scholars").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({ name_english: data.name_english || "", name_arabic: data.name_arabic || "", slug: data.slug || "", birth_year: data.birth_year || "", death_year_ah: data.death_year_ah || "", madhab: data.madhab || "", origin: data.origin || "", bio: data.bio || "" });
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.from("scholars").update(form).eq("id", id);
    if (error) { setError(error.message); setLoading(false); } else { router.push("/admin/scholars"); router.refresh(); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/scholars" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">Edit Scholar</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">English Name *</label><input type="text" value={form.name_english} onChange={(e) => set("name_english", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Arabic Name</label><input type="text" value={form.name_arabic} onChange={(e) => set("name_arabic", e.target.value)} dir="rtl" className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-amiri text-xl" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Slug</label><input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Madhab</label><select value={form.madhab} onChange={(e) => set("madhab", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select</option><option>Hanafi</option><option>Shafi&apos;i</option><option>Maliki</option><option>Hanbali</option><option>Other</option></select></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Birth Year</label><input type="text" value={form.birth_year} onChange={(e) => set("birth_year", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Death Year</label><input type="text" value={form.death_year_ah} onChange={(e) => set("death_year_ah", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Origin</label><input type="text" value={form.origin} onChange={(e) => set("origin", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div data-color-mode="light"><label className="block text-sm font-semibold text-foreground mb-1.5">Biography</label><MDEditor value={form.bio} onChange={(val) => set("bio", val || "")} height={350} /></div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Update Scholar"}</button></div>
      </form>
    </div>
  );
}
