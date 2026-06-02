"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { CategorySelector } from "@/components/admin/CategorySelector";

export default function EditLecture({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const supabase = createClient(); const router = useRouter();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", speaker: "", embed_url: "", duration: "", category: "", sub_category: "", description: "", status: "published" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from("lectures").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({ title: data.title || "", slug: data.slug || "", speaker: data.speaker || "", embed_url: data.embed_url || "", duration: data.duration || "", category: data.category || "", sub_category: data.sub_category || "", description: data.description || "", status: data.status || "published" });
      setFetching(false);
    });
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.from("lectures").update(form).eq("id", id);
    if (error) { setError(error.message); setLoading(false); } else { router.push("/admin/lectures"); router.refresh(); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/lectures" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">Edit Lecture</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label><input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Slug</label><input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Speaker</label><input type="text" value={form.speaker} onChange={(e) => set("speaker", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Duration</label><input type="text" value={form.duration} onChange={(e) => set("duration", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <CategorySelector 
          contentType="lectures" 
          category={form.category} 
          setCategory={(val) => set("category", val)} 
          subCategory={form.sub_category} 
          setSubCategory={(val) => set("sub_category", val)} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Embed URL</label><input type="url" value={form.embed_url} onChange={(e) => set("embed_url", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="published">Published</option>
              <option value="pending">Pending (Hidden)</option>
            </select>
          </div>
        </div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Description</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Update Lecture"}</button></div>
      </form>
    </div>
  );
}
