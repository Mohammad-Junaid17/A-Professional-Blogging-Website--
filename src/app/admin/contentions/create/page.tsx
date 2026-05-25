"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CreateContention() {
  const supabase = createClient(); const router = useRouter();
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ claim: "", rebuttal: "", scholarly_response: "", scholar: "", source: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.from("contentions").insert(form);
    if (error) { setError(error.message); setLoading(false); } else { router.push("/admin/contentions"); router.refresh(); }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8"><Link href="/admin/contentions" className="p-2 hover:bg-muted/10 rounded-lg"><ArrowLeft size={20} className="text-muted" /></Link><h1 className="text-3xl font-bold font-serif text-foreground">New Contention</h1></div>
      {error && <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div><label className="block text-sm font-semibold text-foreground mb-1.5">Claim / Objection *</label><textarea value={form.claim} onChange={(e) => set("claim", e.target.value)} rows={3} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
        <div data-color-mode="light"><label className="block text-sm font-semibold text-foreground mb-1.5">Rebuttal / Evidence Against *</label><MDEditor value={form.rebuttal} onChange={(val) => set("rebuttal", val || "")} height={250} /></div>
        <div data-color-mode="light"><label className="block text-sm font-semibold text-foreground mb-1.5">Scholarly Response</label><MDEditor value={form.scholarly_response} onChange={(val) => set("scholarly_response", val || "")} height={200} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Scholar</label><input type="text" value={form.scholar} onChange={(e) => set("scholar", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-semibold text-foreground mb-1.5">Source</label><input type="text" value={form.source} onChange={(e) => set("source", e.target.value)} className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border"><button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">{loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {loading ? "Saving..." : "Save Contention"}</button></div>
      </form>
    </div>
  );
}
