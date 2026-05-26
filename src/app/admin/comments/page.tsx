"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, X, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Tab = "pending" | "approved" | "rejected";

export default function AdminComments() {
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments");
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();
      // Filter by tab status
      const filtered = (data || []).filter((item: any) => item.status === tab);
      setItems(filtered);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const [adminReplies, setAdminReplies] = useState<Record<string, string>>({});

  const updateStatus = async (id: string, action: string) => {
    setActing(id);
    try {
      const payload: any = { action };
      if (adminReplies[id]?.trim()) {
        payload.admin_reply = adminReplies[id];
      }

      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      toast.success(action === "approve" ? "Comment approved" : action === "save_reply" ? "Reply saved" : "Comment rejected");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update comment");
    }
    setActing(null);
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">Comments Moderation</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-primary text-card" : "bg-card border border-border text-muted hover:text-foreground"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted">No {tab} comments.</div>
      ) : (
        <div className="space-y-4">
          {items.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{comment.content_type}</span>
                <span>• {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : '—'}</span>
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4">&ldquo;{comment.body}&rdquo;</p>
              <div className="flex flex-col gap-3 mt-3">
                {tab === "pending" && (
                  <div className="border-t border-border pt-3">
                    <label className="block text-xs font-semibold text-muted mb-1">Admin Reply (optional)</label>
                    <div data-color-mode="light" className="mb-3">
                      <MDEditor 
                        value={adminReplies[comment.id] || ""} 
                        onChange={(val) => setAdminReplies(p => ({ ...p, [comment.id]: val || "" }))}
                        preview="edit"
                        height={120}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(comment.id, "reject")} disabled={acting === comment.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50">
                        <X size={14} /> Reject
                      </button>
                      <button onClick={() => updateStatus(comment.id, "approve")} disabled={acting === comment.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-500/20 disabled:opacity-50">
                        {acting === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve
                      </button>
                    </div>
                  </div>
                )}
                {tab === "approved" && (
                  <div className="border-t border-border pt-3">
                    <label className="block text-xs font-semibold text-muted mb-1">Admin Reply</label>
                    <div data-color-mode="light" className="mb-3">
                      <MDEditor 
                        value={adminReplies[comment.id] ?? (comment.admin_reply || "")} 
                        onChange={(val) => setAdminReplies(p => ({ ...p, [comment.id]: val || "" }))}
                        preview="edit"
                        height={120}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateStatus(comment.id, "save_reply")} disabled={acting === comment.id}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded text-xs font-semibold hover:bg-primary/20 disabled:opacity-50">
                        {acting === comment.id ? "Saving..." : "Save Reply"}
                      </button>
                      <button onClick={() => updateStatus(comment.id, "reject")} className="text-xs text-red-500 hover:underline">Reject Comment</button>
                    </div>
                  </div>
                )}
                {tab === "rejected" && (
                  <div className="border-t border-border pt-3">
                    <button onClick={() => updateStatus(comment.id, "approve")} className="text-xs text-green-500 hover:underline">Approve Comment</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
