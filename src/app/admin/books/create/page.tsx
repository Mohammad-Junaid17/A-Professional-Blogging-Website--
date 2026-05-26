"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { ImageUpload } from "@/components/admin/ImageUpload";

export default function CreateBook() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", author: "", description: "", language: "", category: "", sub_category: "", pdf_url: "", cover_url: "", status: "published" });
  const [categories, setCategories] = useState<any[]>([]);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const genSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => {
      if (d.data) setCategories(d.data.filter((c:any) => !c.content_type || c.content_type === "books"));
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
    try {
      const res = await fetch("/api/admin/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: form.slug || genSlug(form.title) }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      toast.success("Book saved!"); router.push("/admin/books"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err)); setLoading(false); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/books" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">New Book</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label><input type="text" value={form.title} onChange={(e) => { set("title", e.target.value); if (!form.slug) set("slug", genSlug(e.target.value)); }} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Slug</label><input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Author</label><input type="text" value={form.author} onChange={(e) => set("author", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Language</label><select value={form.language} onChange={(e) => set("language", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select</option><option>Arabic</option><option>English</option><option>Arabic &amp; English</option><option>Urdu</option><option>Other</option></select></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => { set("category", e.target.value); set("sub_category", ""); }} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Category</option>
              {parents.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Sub-category</label>
            <select value={form.sub_category} onChange={(e) => set("sub_category", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" disabled={!form.category || subCategories.length === 0}>
              <option value="">Select Sub-category</option>
              {subCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">PDF URL</label><input type="url" value={form.pdf_url} onChange={(e) => set("pdf_url", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <ImageUpload value={form.cover_url} onChange={(url) => set("cover_url", url)} label="Cover Image URL" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Description</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="published">Published</option>
              <option value="pending">Pending (Hidden)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Save Book"}</button></div>
      </form>
    </div>
  );
}
