"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const CATEGORIES = ["Fiqh", "Aqeedah", "Marriage & Family", "Finance", "Contemporary Issues", "Worship"];

export default function EditQA({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Fiqh");
  const [answer, setAnswer] = useState("");
  const [answeredBy, setAnsweredBy] = useState("");
  const [status, setStatus] = useState("answered");

  useEffect(() => {
    supabase.from("qa_entries").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setQuestion(data.question || "");
        setCategory(data.category || "Fiqh");
        setAnswer(data.admin_answer || data.answer || "");
        setAnsweredBy(data.answered_by || "");
        setStatus(data.status || "answered");
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return toast.error("Question is required");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/qa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update", 
          question, 
          category, 
          answer, 
          scholar: answeredBy,
          status 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update Q&A");
      }

      toast.success("Q&A updated successfully!");
      router.push("/admin/qa");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update Q&A");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/qa" 
          className="p-2 rounded-lg bg-card border border-border text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold font-serif text-foreground">Edit Q&A</h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Question *</label>
            <div data-color-mode="light">
              <MDEditor
                value={question}
                onChange={(val) => setQuestion(val || "")}
                preview="edit"
                height={150}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="answered">Answered / Published</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Answer</label>
            <div data-color-mode="light">
              <MDEditor
                value={answer}
                onChange={(val) => setAnswer(val || "")}
                preview="edit"
                height={250}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Answered By (Scholar Name)</label>
            <input
              type="text"
              value={answeredBy}
              onChange={(e) => setAnsweredBy(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-4 flex justify-end border-t border-border mt-6">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
