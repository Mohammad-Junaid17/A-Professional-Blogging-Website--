import React from "react";
import { PlusCircle, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const { data: categories } = await supabaseAdmin.from("categories").select("*").order("name", { ascending: true });

  // Map to group by parent
  const parents = categories?.filter(c => !c.parent_id) || [];
  const getChildren = (parentId: string) => categories?.filter(c => c.parent_id === parentId) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Manage Categories</h1>
          <p className="text-muted mt-1">Organize books, articles, lectures and more.</p>
        </div>
        <Link href="/admin/categories/create" className="flex items-center gap-2 bg-primary text-card px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">
          <PlusCircle size={20} />
          <span>New Category</span>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border">
                <th className="p-4 font-semibold text-foreground">Name</th>
                <th className="p-4 font-semibold text-foreground">Type Filter</th>
                <th className="p-4 font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((parent) => (
                <React.Fragment key={parent.id}>
                  <tr className="border-b border-border/50 hover:bg-muted/5">
                    <td className="p-4 font-bold text-foreground">{parent.name}</td>
                    <td className="p-4 text-muted text-sm">{parent.content_type || "All"}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link href={`/admin/categories/${parent.id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Pencil size={18} /></Link>
                      <DeleteButton id={parent.id} table="categories" title={parent.name} />
                    </td>
                  </tr>
                  {getChildren(parent.id).map(child => (
                    <tr key={child.id} className="border-b border-border/50 hover:bg-muted/5">
                      <td className="p-4 text-foreground flex items-center gap-2">
                        <span className="text-muted ml-4">↳</span> {child.name}
                      </td>
                      <td className="p-4 text-muted text-sm">{child.content_type || "All"}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Link href={`/admin/categories/${child.id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Pencil size={18} /></Link>
                        <DeleteButton id={child.id} table="categories" title={child.name} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {parents.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted">No categories found. Create one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
