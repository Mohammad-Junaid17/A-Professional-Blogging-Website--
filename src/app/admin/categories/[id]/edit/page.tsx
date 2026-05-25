"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false); 
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", parent_id: "", content_type: "" });
  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => setParents(d.data?.filter((c:any) => !c.parent_id && c.id !== id) || []));
    fetch(`/api/admin/categories/${id}`).then(r => r.json()).then(({data}) => {
      if (data) setForm({ name: data.name || "", parent_id: data.parent_id || "", content_type: data.content_type || "" });
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const payload = { ...form, parent_id: form.parent_id || null, content_type: form.content_type || null };
      const res = await fetch(`/api/admin/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      toast.success("Category updated!"); router.push("/admin/categories"); router.refresh();
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/categories" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">Edit Category</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Category Name *</label><input type="text" value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
        
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Parent Category (Optional)</label>
          <select value={form.parent_id} onChange={(e) => setForm(p => ({...p, parent_id: e.target.value}))} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">None (Top Level)</option>
            {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Content Type Filter (Optional)</label>
          <select value={form.content_type} onChange={(e) => setForm(p => ({...p, content_type: e.target.value}))} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Types</option>
            <option value="books">Books</option>
            <option value="articles">Articles</option>
            <option value="lectures">Lectures</option>
            <option value="qa">Q&A</option>
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Update Category"}</button></div>
      </form>
    </div>
  );
}
