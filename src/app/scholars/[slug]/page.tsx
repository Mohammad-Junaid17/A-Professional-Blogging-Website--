import Link from "next/link";
import { ChevronRight, Users, MapPin, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/ui/Cards";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export const revalidate = 60;

export default async function ScholarPage(props: { params: Promise<{ slug: string  }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: scholar } = await supabase
    .from("scholars")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!scholar) {
    notFound();
  }

  // Fetch books by this scholar
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .ilike("author", `%${scholar.name_english}%`)
    .limit(4);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href="/scholars" className="hover:text-primary transition-colors">Scholars</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium truncate">{scholar.name_english}</span>
      </div>

      <header className="bg-card border border-border rounded-xl p-8 mb-12 text-center md:text-left flex flex-col md:flex-row gap-8 items-center md:items-start relative">
        <AdminEditButton id={scholar.id} type="scholars" />
        <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-card shrink-0 overflow-hidden border-4 border-primary/20 shadow-md">
          {scholar.image_url ? (
            <img src={scholar.image_url} alt={scholar.name_english} className="w-full h-full object-cover" />
          ) : (
            <Users size={64} />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold font-serif text-foreground">{scholar.name_english}</h1>
              {scholar.name_arabic && (
                <p className="font-amiri text-2xl text-primary mt-2" dir="rtl">{scholar.name_arabic}</p>
              )}
            </div>
            {scholar.madhab && (
              <span className="bg-nav-active text-primary font-bold px-4 py-2 rounded-full text-sm">
                {scholar.madhab}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted mt-6">
            <div>
              <strong>Born:</strong> {scholar.birth_year || "Unknown"}
            </div>
            <div>
              <strong>Died:</strong> {scholar.death_year_ah ? `${scholar.death_year_ah} AH` : "Unknown"}
            </div>
            {scholar.origin && (
              <div className="flex items-center gap-1 justify-center md:justify-start sm:col-span-2">
                <MapPin size={16} /> {scholar.origin}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold font-serif mb-4 border-b border-border pb-2">Biography</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted leading-relaxed">
              <MarkdownRenderer content={scholar.bio || "Biography details not available."} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {scholar.notable_works && scholar.notable_works.length > 0 && (
            <section className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-primary" /> Notable Works
              </h3>
              <ul className="space-y-2 text-sm text-muted">
                {scholar.notable_works.map((work: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span> {work}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {books && books.length > 0 && (
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold font-serif mb-8">Books by {scholar.name_english}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <CommentSection contentType="scholar" contentId={scholar.id} />
    </div>
  );
}
