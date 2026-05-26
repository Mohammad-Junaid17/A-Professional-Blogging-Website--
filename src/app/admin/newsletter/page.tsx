"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Trash2, Loader2, Mail } from "lucide-react";

export default function AdminNewsletter() {
  const supabase = createClient();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setSubs(data || []); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    setSubs(subs.filter(s => s.id !== id));
  };

  const handleExport = () => {
    const csv = "Email,Subscribed Date\n" + subs.map(s => `${s.email},${s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "newsletter_subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Newsletter</h1>
          <p className="text-muted text-sm mt-1">{subs.length} total subscribers</p>
        </div>
        <button onClick={handleExport} disabled={subs.length === 0}
          className="flex items-center gap-2 bg-primary text-card px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border"><tr>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-muted/5">
                  <td className="px-4 py-3 text-foreground flex items-center gap-2"><Mail size={14} className="text-muted" /> {s.email}</td>
                  <td className="px-4 py-3 text-muted">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
