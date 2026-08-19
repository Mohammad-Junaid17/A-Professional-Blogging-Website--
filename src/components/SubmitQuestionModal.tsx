"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Send, Loader2, HelpCircle } from "lucide-react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const CATEGORIES = ["Fiqh", "Aqeedah", "Marriage & Family", "Finance", "Contemporary Issues", "Worship"];

export default function SubmitQuestionModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Fiqh");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to submit a question.");
      setLoading(false);
      return;
    }

    const slug = question
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) + "-" + Date.now().toString(36);

    const { error: insertError } = await supabase.from("qa_entries").insert({
      question,
      answer: context || "Pending answer from scholars.",
      category,
      slug,
      submitted_by: user.id,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            <h2 className="text-lg font-bold font-serif text-foreground">Ask a Question</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted/10 transition-colors text-muted">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Question Submitted!</h3>
            <p className="text-muted text-sm mb-4">
              Your question has been submitted and is under review. 
            </p>
            <div className="bg-primary/5 border-l-4 border-primary p-3 mb-6 text-left text-sm text-muted-foreground italic rounded-r">
              <span className="font-semibold text-primary">Note:</span> Obtaining answers from scholars takes time. Please allow at least 72 hours before expecting a response. JazakAllah khayran.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-card rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Your Question <span className="text-red-500">*</span>
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={question}
                  onChange={(val) => setQuestion(val || "")}
                  preview="edit"
                  height={200}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Additional Context <span className="text-muted text-xs font-normal">(optional)</span>
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={context}
                  onChange={(val) => setContext(val || "")}
                  preview="edit"
                  height={150}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex items-center gap-2 bg-primary text-card px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
