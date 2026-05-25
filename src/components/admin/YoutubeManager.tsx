"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function YoutubeManager() {
  const [channels, setChannels] = useState<any[]>([]);
  const [newHandle, setNewHandle] = useState("");
  const [newId, setNewId] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/admin/youtube/channels");
      const data = await res.json();
      if (data.data) setChannels(data.data);
    } catch (e) {}
  };

  const addChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/youtube/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: newHandle, channel_id: newId }),
      });
      if (res.ok) {
        setNewHandle(""); setNewId("");
        fetchChannels();
        toast.success("Channel added");
      } else {
        toast.error("Failed to add channel");
      }
    } catch (e) {
      toast.error("Error adding channel");
    }
    setLoading(false);
  };

  const deleteChannel = async (id: string) => {
    if (!confirm("Remove this channel from sync?")) return;
    try {
      const res = await fetch(`/api/admin/youtube/channels?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchChannels();
        toast.success("Channel removed");
      }
    } catch (e) {}
  };

  const syncChannels = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/youtube/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced successfully! Added ${data.added} new videos.`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to sync");
      }
    } catch (e) {
      toast.error("Error syncing channels");
    }
    setSyncing(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </div>
          <div>
            <h2 className="font-bold text-foreground">YouTube Auto-Sync</h2>
            <p className="text-sm text-muted">Automatically fetch videos from these channels</p>
          </div>
        </div>
        <button
          onClick={syncChannels}
          disabled={syncing || channels.length === 0}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      <div className="space-y-4">
        {channels.map(c => (
          <div key={c.id} className="flex items-center justify-between bg-background p-3 rounded-lg border border-border">
            <div>
              <p className="font-semibold text-foreground text-sm">{c.handle}</p>
              <p className="text-xs text-muted font-mono">{c.channel_id}</p>
            </div>
            <button onClick={() => deleteChannel(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addChannel} className="mt-4 flex gap-3">
        <input
          type="text"
          value={newHandle}
          onChange={(e) => setNewHandle(e.target.value)}
          placeholder="Channel Handle or URL (e.g. @MuftiAsjadRaza or https://youtube.com/...)"
          className="flex-1 p-2 bg-background border border-border rounded-lg text-sm"
          required
        />
        <input
          type="text"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="Channel ID (UC...)"
          className="flex-1 p-2 bg-background border border-border rounded-lg text-sm font-mono"
        />
        <button type="submit" disabled={loading} className="p-2 bg-primary text-card rounded-lg hover:bg-primary/90 transition-colors">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
        </button>
      </form>
    </div>
  );
}
