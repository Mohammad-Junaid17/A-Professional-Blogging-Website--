/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

import { YoutubeManager } from "@/components/admin/YoutubeManager";

export const dynamic = "force-dynamic";

export default async function AdminLectures() {
  const { data: lectures } = await supabaseAdmin.from("lectures").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">Lectures</h1>
        <Link href="/admin/lectures/create" className="flex items-center gap-2 bg-primary text-card px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"><PlusCircle size={18} /> New Lecture</Link>
      </div>

      <YoutubeManager />

      <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-background border-b border-border"><tr>
          <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
          <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Speaker</th>
          <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Duration</th>
          <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Category</th>
          <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {lectures && lectures.map((l: any) => (
            <tr key={l.id} className="hover:bg-muted/5">
              <td className="px-4 py-3 text-foreground font-medium">{l.title}</td>
              <td className="px-4 py-3 text-muted hidden md:table-cell">{l.speaker || "—"}</td>
              <td className="px-4 py-3 text-muted hidden lg:table-cell">{l.duration || "—"}</td>
              <td className="px-4 py-3 text-muted hidden sm:table-cell">{l.category || "—"}</td>
              <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                <Link href={`/admin/lectures/${l.id}/edit`} className="p-2 text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"><Pencil size={16} /></Link>
                <DeleteButton id={l.id} table="lectures" />
              </div></td>
            </tr>
          ))}
          {(!lectures || lectures.length === 0) && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No lectures found.</td></tr>}
        </tbody>
      </table></div></div>
    </div>
  );
}
