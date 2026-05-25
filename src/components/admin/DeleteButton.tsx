"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function DeleteButton({ id, table }: { id: string; table: string }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${table}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      toast.success("Deleted successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
      setConfirming(false);
      setConfirmText("");
    }
  };

  if (confirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
          <h3 className="text-lg font-bold text-foreground mb-2">Confirm Deletion</h3>
          <p className="text-sm text-muted mb-4">
            Type <strong className="text-red-500">DELETE</strong> to confirm this action. This cannot be undone.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "DELETE"'
            className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setConfirming(false); setConfirmText(""); }}
              className="px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  );
}
