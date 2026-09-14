import { BookOpen, ChevronRight } from "lucide-react";
import { BookCard } from "@/components/ui/Cards";
import { CategoryFilterBar } from "@/components/ui/CategoryFilterBar";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Islamic Books & Library — Classical Treatises & Translations",
  description: "Browse our curated library of translated Islamic books, classical treatises, and scholarly works from the Ahl as-Sunnah tradition. Available in English and Urdu.",
};

export default async function BooksPage(props: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentCategory = searchParams.category || "";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("books").select("*").eq("status", "published").order("created_at", { ascending: false });
  if (currentCategory) query = query.ilike("category", `%${currentCategory}%`);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);
  const { data: books } = await query;

  const { data: categoryData } = await supabase.from("categories").select("name").or("content_type.eq.books,content_type.is.null").order("name", { ascending: true });
  const CATEGORIES = categoryData?.map((c) => c.name) || [];

  const { data: countData } = await supabase.from("books").select("category").eq("status", "published");
  const countMap: Record<string, number> = {};
  countData?.forEach((r) => { if (r.category) countMap[r.category] = (countMap[r.category] || 0) + 1; });
  const CATEGORY_COUNTS = CATEGORIES.map((name) => ({ name, count: countMap[name] || 0 }));

  const { data: titleData } = await supabase.from("books").select("title").eq("status", "published").limit(200);
  const TITLES = titleData?.map((t) => t.title).filter(Boolean) as string[] || [];

  const resultCount = books?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Books & Library</span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary"><BookOpen size={20} /></div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Islamic Books & Classical Treatises</h1>
        <AdminAddButton type="books" label="Add Book" />
      </div>
      <Suspense>
        <CategoryFilterBar
          categories={CATEGORIES}
          categoryCounts={CATEGORY_COUNTS}
          allCategoryLabel="All Books"
          paramName="category"
          searchPlaceholder="Search books by title..."
          resultCount={resultCount}
          visibleCount={8}
          basePath="/books"
          section="books"
          autocompleteItems={TITLES}
        />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {books && books.length > 0 ? books.map((book) => <BookCard key={book.id} book={book} />) : (
          <div className="col-span-full py-16 text-center">
            <p className="text-muted text-lg mb-2">No books found</p>
            <p className="text-muted/60 text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
