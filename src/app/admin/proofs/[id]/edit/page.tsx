"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditProof({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const supabase = createClient(); const router = useRouter();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ proof_type: "quran", arabic_text: "", transliteration: "", translation: "", source_reference: "", category: "", sub_category: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => {
      if (d.data) setCategories(d.data.filter((c:any) => !c.content_type || c.content_type === "proofs"));
    });
    supabase.from("proofs").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({ proof_type: data.proof_type || "quran", arabic_text: data.arabic_text || "", transliteration: data.transliteration || "", translation: data.translation || "", source_reference: data.source_reference || "", category: data.category || "", sub_category: data.sub_category || "" });
      setFetching(false);
    });
  }, [id]);

  const parents = categories.filter(c => !c.parent_id);
  const getSubCategories = () => {
    const parent = categories.find(c => c.name === form.category);
    if (!parent) return [];
    return categories.filter(c => c.parent_id === parent.id);
  };
  const subCategories = getSubCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.from("proofs").update(form).eq("id", id);
    if (error) { setError(error.message); setLoading(false); } else { router.push("/admin/proofs"); router.refresh(); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/proofs" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">Edit Proof</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Type *</label><select value={form.proof_type} onChange={(e) => set("proof_type", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"><option value="quran">Quran</option><option value="hadith">Hadith</option><option value="ijma">Ijmāʿ</option></select></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Source Ref</label><input type="text" value={form.source_reference} onChange={(e) => set("source_reference", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => { set("category", e.target.value); set("sub_category", ""); }} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Category</option>
              {parents.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Sub-category</label>
            <select value={form.sub_category} onChange={(e) => set("sub_category", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" disabled={!form.category || subCategories.length === 0}>
              <option value="">Select Sub-category</option>
              {subCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select></div>
        </div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Arabic</label><textarea value={form.arabic_text} onChange={(e) => set("arabic_text", e.target.value)} rows={4} dir="rtl" className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-amiri text-xl" /></div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Transliteration</label><textarea value={form.transliteration} onChange={(e) => set("transliteration", e.target.value)} rows={2} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary italic" /></div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Translation *</label><textarea value={form.translation} onChange={(e) => set("translation", e.target.value)} rows={3} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Update Proof"}</button></div>
      </form>
    </div>
  );
}
