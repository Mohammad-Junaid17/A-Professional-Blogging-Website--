/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminProofs() {
  const { data: proofs } = await supabaseAdmin.from("proofs").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">Proofs</h1>
        <Link href="/admin/proofs/create" className="flex items-center gap-2 bg-primary text-card px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"><PlusCircle size={18} /> New Proof</Link>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-background border-b border-border"><tr>
          <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
          <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Source</th>
          <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Preview</th>
          <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {proofs && proofs.map((p: any) => (
            <tr key={p.id} className="hover:bg-muted/5">
              <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${p.proof_type === "quran" ? "bg-emerald-500/10 text-emerald-600" : p.proof_type === "hadith" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>{p.proof_type}</span></td>
              <td className="px-4 py-3 text-muted hidden md:table-cell">{p.source_reference || "—"}</td>
              <td className="px-4 py-3 text-muted hidden lg:table-cell max-w-[300px] truncate">{p.translation}</td>
              <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                <Link href={`/admin/proofs/${p.id}/edit`} className="p-2 text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"><Pencil size={16} /></Link>
                <DeleteButton id={p.id} table="proofs" />
              </div></td>
            </tr>
          ))}
          {(!proofs || proofs.length === 0) && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No proofs found.</td></tr>}
        </tbody>
      </table></div></div>
    </div>
  );
}
