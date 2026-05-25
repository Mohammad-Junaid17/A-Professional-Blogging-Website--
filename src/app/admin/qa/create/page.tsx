"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const CATEGORIES = ["Fiqh", "Aqeedah", "Marriage & Family", "Finance", "Contemporary Issues", "Worship"];

export default function CreateQA() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Fiqh");
  const [answer, setAnswer] = useState("");
  const [answeredBy, setAnsweredBy] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return toast.error("Question is required");
    if (!answer.trim()) return toast.error("Answer is required");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, category, answer, answered_by: answeredBy }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create Q&A");
      }

      toast.success("Q&A created and published successfully!");
      router.push("/admin/qa");
    } catch (err: any) {
      toast.error(err.message || "Failed to create Q&A");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/qa" 
          className="p-2 rounded-lg bg-card border border-border text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold font-serif text-foreground">Create Q&A</h1>
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
            <label className="block text-sm font-semibold text-foreground mb-1.5">Answer *</label>
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
              placeholder="e.g., Shaykh Admin"
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || !question.trim() || !answer.trim()}
              className="flex items-center gap-2 bg-primary text-card px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Publishing..." : "Publish Q&A"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
