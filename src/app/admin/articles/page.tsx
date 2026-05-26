/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { PlusCircle, Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminArticles() {
  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">Articles</h1>
        <Link href="/admin/articles/create" className="flex items-center gap-2 bg-primary text-card px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
          <PlusCircle size={18} /> New Article
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles && articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-muted/5">
                  <td className="px-4 py-3 text-foreground font-medium max-w-[250px] truncate">{article.title}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{article.category || "—"}</span>
                      {article.status === "pending" && <span className="bg-orange-500/10 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">Pending</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">{article.author || "—"}</td>
                  <td className="px-4 py-3 text-muted hidden sm:table-cell">{article.created_at ? new Date(article.created_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/articles/${article.slug}`} className="p-2 text-muted hover:text-foreground hover:bg-muted/10 rounded-md transition-colors" title="View">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/admin/articles/${article.id}/edit`} className="p-2 text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton id={article.id} table="articles" />
                    </div>
                  </td>
                </tr>
              ))}
              {(!articles || articles.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No articles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
