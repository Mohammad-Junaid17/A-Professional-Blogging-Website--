/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminBooks() {
  const { data: books } = await supabaseAdmin.from("books").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">Books</h1>
        <Link href="/admin/books/create" className="flex items-center gap-2 bg-primary text-card px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
          <PlusCircle size={18} /> New Book
        </Link>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Language</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books && books.map((book: any) => (
                <tr key={book.id} className="hover:bg-muted/5">
                  <td className="px-4 py-3 text-foreground font-medium">{book.title}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{book.author || "—"}</td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">{book.language || "—"}</td>
                  <td className="px-4 py-3 text-muted hidden sm:table-cell">{book.category || "—"}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/books/${book.id}/edit`} className="p-2 text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"><Pencil size={16} /></Link>
                    <DeleteButton id={book.id} table="books" />
                  </div></td>
                </tr>
              ))}
              {(!books || books.length === 0) && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No books found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
