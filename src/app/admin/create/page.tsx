"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

type ContentType = "articles" | "books" | "scholars" | "qa_entries";

export default function CreateEntryPage() {
  const supabase = createClient();
  
  const [contentType, setContentType] = useState<ContentType>("articles");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Clean up empty strings to null for optional fields if needed, or just let Supabase handle it
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([key, val]) => [key, val === "" ? null : val])
    );

    const { error } = await supabase.from(contentType).insert([cleanData]);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: `Successfully added to ${contentType}!` });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-muted/10 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-muted" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Create New Entry</h1>
          <p className="text-muted text-sm mt-1">Add new content directly to the database.</p>
        </div>
      </div>

      <div className="bg-card border border-border p-8 rounded-xl shadow-sm">
        <div className="mb-8 pb-8 border-b border-border">
          <label className="block text-sm font-bold text-foreground mb-2">Content Type</label>
          <select 
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="articles">Article</option>
            <option value="books">Book</option>
            <option value="scholars">Scholar</option>
            <option value="qa_entries">Q&A Entry</option>
          </select>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {contentType === "articles" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Title" name="title" required />
                <Input label="URL Slug" name="slug" placeholder="e.g. importance-of-intentions" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Author" name="author" />
                <Input label="Category" name="category" />
                <Input label="Reading Time (mins)" name="reading_time" type="number" />
              </div>
              <Textarea label="Excerpt" name="excerpt" rows={2} />
              <Textarea label="Content (Markdown)" name="content" rows={10} required />
            </>
          )}

          {contentType === "books" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Title" name="title" required />
                <Input label="URL Slug" name="slug" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Author" name="author" />
                <Input label="Language" name="language" />
                <Input label="Category" name="category" />
              </div>
              <Input label="PDF URL" name="pdf_url" type="url" />
              <Textarea label="Description" name="description" rows={4} />
            </>
          )}

          {contentType === "scholars" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="English Name" name="name_english" required />
                <Input label="Arabic Name" name="name_arabic" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="URL Slug" name="slug" required />
                <Input label="Madhab" name="madhab" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Birth Year" name="birth_year" placeholder="e.g. 80 AH" />
                <Input label="Death Year" name="death_year_ah" placeholder="e.g. 150" />
                <Input label="Origin" name="origin" placeholder="e.g. Kufa, Iraq" />
              </div>
              <Textarea label="Biography (Markdown)" name="bio" rows={8} />
            </>
          )}

          {contentType === "qa_entries" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="URL Slug" name="slug" required />
                <Input label="Scholar" name="scholar" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Category" name="category" />
                <Input label="Sub Category" name="sub_category" />
              </div>
              <Textarea label="Question" name="question" rows={2} required />
              <Textarea label="Answer (Markdown)" name="answer" rows={8} required />
            </>
          )}

          <div className="pt-6 border-t border-border flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Reusable Input Component
function Input({ label, name, required = false, type = "text", placeholder = "", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted/50"
        {...props}
      />
    </div>
  );
}

// Reusable Textarea Component
function Textarea({ label, name, required = false, rows = 4, className = "", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea 
        name={name}
        required={required}
        rows={rows}
        className={`w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        {...props}
      />
    </div>
  );
}
