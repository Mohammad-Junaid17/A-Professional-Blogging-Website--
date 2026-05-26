import Link from "next/link";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { BookCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";

// Categories are fetched dynamically

export default async function BooksPage(props: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const currentCategory = searchParams.category || "All Books";
  const searchQuery = searchParams.q || "";

  let query = supabase.from("books").select("*").eq("status", "published").order("created_at", { ascending: false });

  if (currentCategory !== "All Books") {
    // Assuming book categories might be multi or single, standard ilike or eq. Using ilike for flexibility.
    query = query.ilike("category", `%${currentCategory}%`);
  }
  
  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: books } = await query;

  const { data: categoryData } = await supabase
    .from("categories")
    .select("name")
    .or("content_type.eq.books,content_type.is.null")
    .order("name", { ascending: true });
  
  const fetchedCategories = categoryData?.map(c => c.name) || [];
  const CATEGORIES = ["All Books", ...fetchedCategories];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar - 25% */}
      <aside className="w-full md:w-1/4 shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-muted mb-4 uppercase">Topics</h2>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <li key={cat}>
                <Link
                  href={`/books?category=${cat === "All Books" ? "" : cat}`}
                  className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                    isActive 
                      ? "bg-primary text-card font-semibold" 
                      : "text-muted hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  {cat}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content - 75% */}
      <main className="w-full md:w-3/4">
        <div className="flex items-center text-sm text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-foreground font-medium">Books & Library</span>
        </div>

        <div className="flex items-center gap-3 mb-8 w-full">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary">
            <BookOpen size={20} />
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Books & Library</h1>
          <AdminAddButton type="books" label="Add Book" />
        </div>

        <form method="GET" action="/books" className="relative mb-8">
          <input type="hidden" name="category" value={currentCategory === "All Books" ? "" : currentCategory} />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search books by title..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Book Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {books && books.length > 0 ? (
            books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="col-span-1 lg:col-span-2 py-12 text-center text-muted">
              No books found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
