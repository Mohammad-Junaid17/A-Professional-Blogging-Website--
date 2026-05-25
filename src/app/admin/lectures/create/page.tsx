"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateLecture() {
  const supabase = createClient(); const router = useRouter();
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", speaker: "", embed_url: "", duration: "", category: "", sub_category: "", description: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const genSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => {
      if (d.data) setCategories(d.data.filter((c:any) => !c.content_type || c.content_type === "lectures"));
    });
  }, []);

  const parents = categories.filter(c => !c.parent_id);
  const getSubCategories = () => {
    const parent = categories.find(c => c.name === form.category);
    if (!parent) return [];
    return categories.filter(c => c.parent_id === parent.id);
  };
  const subCategories = getSubCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.from("lectures").insert({ ...form, slug: form.slug || genSlug(form.title) });
    if (error) { setError(error.message); setLoading(false); } else { router.push("/admin/lectures"); router.refresh(); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/lectures" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">New Lecture</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label><input type="text" value={form.title} onChange={(e) => { set("title", e.target.value); if (!form.slug) set("slug", genSlug(e.target.value)); }} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Slug</label><input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Speaker</label><input type="text" value={form.speaker} onChange={(e) => set("speaker", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Duration</label><input type="text" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 45:00" className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
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
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Embed URL</label><input type="url" value={form.embed_url} onChange={(e) => set("embed_url", e.target.value)} placeholder="YouTube/Vimeo URL" className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Description</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Save Lecture"}</button></div>
      </form>
    </div>
  );
}
