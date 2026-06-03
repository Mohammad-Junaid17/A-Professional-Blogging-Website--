"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { CategorySelector } from "@/components/admin/CategorySelector";
import { DeleteButton } from "@/components/admin/DeleteButton";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ returnUrl?: string }> }) {
  const { id } = React.use(params);
  const { returnUrl } = React.use(searchParams);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");
  useEffect(() => {
    fetch(`/api/admin/articles/${id}`).then(res => res.json()).then(({ data }) => {
      if (data) {
        setTitle(data.title || ""); setSlug(data.slug || ""); setAuthor(data.author || "");
        setCategory(data.category || ""); setSubCategory(data.sub_category || ""); setReadingTime(data.reading_time?.toString() || "");
        setExcerpt(data.excerpt || ""); setContent(data.content || ""); setStatus(data.status || "published");
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, author, category, sub_category: subCategory,
          reading_time: readingTime ? parseInt(readingTime) : null,
          excerpt, content, status
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      toast.success("Article updated!");
      const destination = returnUrl || (category ? `/articles?category=${encodeURIComponent(category)}` : "/admin/articles");
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link>
        <h1 className="text-3xl font-bold font-serif text-foreground">Edit Article</h1>
      </div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Slug</label><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Author</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Reading Time</label><input type="number" value={readingTime} onChange={(e) => setReadingTime(e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <CategorySelector 
          contentType="articles" 
          category={category} 
          setCategory={setCategory} 
          subCategory={subCategory} 
          setSubCategory={setSubCategory} 
        />
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="published">Published</option>
            <option value="pending">Pending (Hidden)</option>
          </select>
        </div>
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Excerpt</label><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        <div data-color-mode="light"><label className="block text-sm font-semibold text-foreground mb-1.5">Content *</label><MDEditor value={content} onChange={(val) => setContent(val || "")} height={400} /></div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <DeleteButton id={id} table="articles" redirectTo="/admin/articles" />
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Update Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
