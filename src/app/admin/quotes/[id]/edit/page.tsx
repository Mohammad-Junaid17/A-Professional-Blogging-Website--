"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditQuote({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const supabase = createClient(); const router = useRouter();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ arabic_text: "", english_text: "", attribution: "", source: "", source_type: "scholar" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from("quotes").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({ arabic_text: data.arabic_text || "", english_text: data.english_text || "", attribution: data.attribution || "", source: data.source || "", source_type: data.source_type || "scholar" });
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.from("quotes").update(form).eq("id", id);
    if (error) { setError(error.message); setLoading(false); } else { router.push("/admin/quotes"); router.refresh(); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/quotes" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">Edit Quote</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">English Text *</label><textarea value={form.english_text} onChange={(e) => set("english_text", e.target.value)} rows={3} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Arabic Text</label><textarea value={form.arabic_text} onChange={(e) => set("arabic_text", e.target.value)} rows={3} dir="rtl" className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-amiri text-xl" /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Attribution</label><input type="text" value={form.attribution} onChange={(e) => set("attribution", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Source</label><input type="text" value={form.source} onChange={(e) => set("source", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Source Type</label><select value={form.source_type} onChange={(e) => set("source_type", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"><option value="scholar">Scholar</option><option value="quran">Quran</option><option value="hadith">Hadith</option></select></div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Update Quote"}</button></div>
      </form>
    </div>
  );
}
