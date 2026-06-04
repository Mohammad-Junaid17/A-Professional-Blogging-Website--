"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, X, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Tab = "pending" | "answered" | "rejected";

export default function AdminQA() {
  const [tab, setTab] = useState<Tab>("pending");
  const [allData, setAllData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredBy, setAnsweredBy] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/qa");
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();
      setAllData(data || []);
    } catch {
      setAllData([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const items = allData.filter((item) => {
    if (item.status !== tab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (item.question || "").toLowerCase().includes(q) || 
             (item.admin_answer || "").toLowerCase().includes(q) ||
             (item.answered_by || "").toLowerCase().includes(q);
    }
    return true;
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handlePublish = async (id: string, isEdit = false) => {
    if (!answers[id]?.trim()) {
      toast.error("Answer is required");
      return;
    }
    setActing(id);
    try {
      const res = await fetch(`/api/admin/qa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isEdit ? "edit_answer" : "answer",
          answer: answers[id],
          scholar: answeredBy[id] || "Admin",
          question: questions[id] !== undefined ? questions[id] : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }
      toast.success(isEdit ? "Answer updated and notification sent" : "Answer published");
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish answer");
    }
    setActing(null);
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/qa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      toast.success("Question rejected");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }
    setActing(null);
  };

  const handleRevert = async (id: string, to: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/qa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revert", status: to }),
      });
      if (!res.ok) throw new Error("Failed to revert");
      toast.success("Moved to " + to);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to revert");
    }
    setActing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/qa/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Question deleted permanently");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
    setActing(null);
  };

  const handleDeleteAllRejected = async () => {
    if (!confirm("Are you sure you want to permanently delete ALL rejected questions? This cannot be undone.")) return;
    setActing("delete_all");
    try {
      const res = await fetch(`/api/admin/qa?action=delete_all_rejected`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete all rejected questions");
      toast.success("All rejected questions deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
    setActing(null);
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "answered", label: "Answered", icon: CheckCircle },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold font-serif text-foreground">
          Q&A Management 
          <span className="text-lg text-muted font-sans font-normal ml-3">
            ({allData.length} total)
          </span>
        </h1>
        <Link 
          href="/admin/qa/create" 
          className="px-4 py-2 bg-primary text-card rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 text-center"
        >
          + Create Q&A
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map(({ key, label, icon: Icon }) => {
            const count = allData.filter(i => i.status === key).length;
            return (
              <button key={key} onClick={() => { setTab(key); setEditingId(null); setExpandedId(null); }}
                className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-primary text-card" : "bg-card border border-border text-muted hover:text-foreground"}`}>
                <Icon size={16} /> {label} ({count})
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {tab === "rejected" && items.length > 0 && (
            <button 
              onClick={handleDeleteAllRejected} 
              disabled={acting === "delete_all"}
              className="px-3 py-2 text-sm font-semibold bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors shrink-0 flex items-center gap-2 disabled:opacity-50"
            >
              {acting === "delete_all" ? <Loader2 size={16} className="animate-spin" /> : "Delete All"}
            </button>
          )}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted">No {tab} questions.</div>
      ) : (
        <div className="space-y-4">
          {items.map((qa) => (
            <div key={qa.id} className="bg-card border border-border rounded-xl p-6">
              <div 
                className={`flex items-start justify-between gap-4 mb-3 cursor-pointer hover:bg-muted/5 p-2 rounded-lg -m-2`}
                onClick={() => {
                  setExpandedId(expandedId === qa.id ? null : qa.id);
                }}
              >
                <div>
                  <p className="text-foreground font-semibold">Q: {qa.question}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    {qa.category && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{qa.category}</span>}
                    <span>{qa.created_at ? new Date(qa.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>

              {tab === "pending" && expandedId === qa.id && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Edit Question</label>
                    <textarea 
                      value={questions[qa.id] !== undefined ? questions[qa.id] : qa.question} 
                      onChange={(e) => setQuestions(p => ({ ...p, [qa.id]: e.target.value }))}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Answer *</label>
                    <div data-color-mode="light" className="mb-2">
                      <MDEditor value={answers[qa.id] || ""} onChange={(val) => setAnswers(p => ({ ...p, [qa.id]: val || "" }))} preview="edit" height={150} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Answered by (scholar name)</label>
                    <input type="text" value={answeredBy[qa.id] || ""} onChange={(e) => setAnsweredBy(p => ({ ...p, [qa.id]: e.target.value }))}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleReject(qa.id)} disabled={acting === qa.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50">
                      <X size={16} /> Reject
                    </button>
                    <button onClick={() => handlePublish(qa.id)} disabled={acting === qa.id || !answers[qa.id]?.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition-colors disabled:opacity-50">
                      {acting === qa.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Publish Answer
                    </button>
                  </div>
                </div>
              )}

              {tab === "answered" && (qa.admin_answer || qa.answer) && expandedId === qa.id && (
                <div className="mt-4 border-t border-border pt-4">
                  {editingId === qa.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Edit Question</label>
                        <textarea 
                          value={questions[qa.id] !== undefined ? questions[qa.id] : qa.question} 
                          onChange={(e) => setQuestions(p => ({ ...p, [qa.id]: e.target.value }))}
                          className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[80px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Edit Answer *</label>
                        <div data-color-mode="light" className="mb-2">
                          <MDEditor value={answers[qa.id] ?? (qa.admin_answer || qa.answer)} onChange={(val) => setAnswers(p => ({ ...p, [qa.id]: val || "" }))} preview="edit" height={150} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Answered by</label>
                        <input type="text" value={answeredBy[qa.id] ?? (qa.answered_by || "")} onChange={(e) => setAnsweredBy(p => ({ ...p, [qa.id]: e.target.value }))}
                          className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button onClick={() => setEditingId(null)} disabled={acting === qa.id} className="text-sm font-medium text-muted hover:text-foreground">Cancel</button>
                        <button onClick={() => handlePublish(qa.id, true)} disabled={acting === qa.id}
                          className="flex items-center gap-2 px-4 py-1.5 bg-primary text-card rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                          {acting === qa.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-muted"><strong>A:</strong> <MarkdownRenderer content={qa.admin_answer || qa.answer} /></div>
                      {qa.answered_by && <p className="text-xs text-muted mt-1">— {qa.answered_by}</p>}
                      <div className="flex gap-4 mt-3">
                        <button onClick={() => {
                          setAnswers(p => ({ ...p, [qa.id]: qa.admin_answer || qa.answer }));
                          setAnsweredBy(p => ({ ...p, [qa.id]: qa.answered_by || "" }));
                          setQuestions(p => ({ ...p, [qa.id]: qa.question }));
                          setEditingId(qa.id);
                        }} className="text-xs text-primary hover:underline">Edit Answer</button>
                        <button onClick={() => handleRevert(qa.id, "pending")} className="text-xs text-primary hover:underline">Move to Pending</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === "rejected" && expandedId === qa.id && (
                <div className="mt-4 border-t border-border pt-4 flex gap-4">
                  <button onClick={() => handleRevert(qa.id, "pending")} className="text-xs text-primary hover:underline">Move to Pending</button>
                  <button onClick={() => handleDelete(qa.id)} className="text-xs text-red-500 hover:underline">Delete Permanently</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
