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
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <AdminEditButton id={scholar.id} type="scholars" />
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-1">&rsaquo;</span>
        <Link href="/scholars" className="hover:text-primary transition-colors">Scholars</Link>
        <span className="mx-1">&rsaquo;</span>
        <span className="text-foreground font-medium truncate">{scholar.name_english}</span>
      </div>

      {/* Header */}
      <header className="mb-10 text-center flex flex-col items-center">
        <div className="w-32 h-32 mb-6 bg-primary rounded-full flex items-center justify-center text-card shrink-0 overflow-hidden border-4 border-primary/20 shadow-md">
          {scholar.image_url ? (
            <img src={scholar.image_url} alt={scholar.name_english} className="w-full h-full object-cover" />
          ) : (
            <Users size={64} />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          {scholar.madhab && (
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {scholar.madhab}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-2">
          {scholar.name_english}
        </h1>
        
        {scholar.name_arabic && (
          <p className="font-amiri text-2xl md:text-3xl text-primary mb-6" dir="rtl">{scholar.name_arabic}</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted border-b border-border pb-8 w-full">
          {scholar.birth_year && (
            <span className="font-medium text-foreground">Born: {scholar.birth_year}</span>
          )}
          {(scholar.birth_year && scholar.death_year_ah) && <span>|</span>}
          {scholar.death_year_ah && (
            <span className="font-medium text-foreground">Died: {scholar.death_year_ah} AH</span>
          )}
          {(scholar.origin && (scholar.birth_year || scholar.death_year_ah)) && <span>|</span>}
          {scholar.origin && (
            <span className="flex items-center gap-1">
              <MapPin size={16} className="text-primary" /> {scholar.origin}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div className="md:col-span-2 space-y-8">
          <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed text-gray-700 dark:text-gray-300">
            <MarkdownRenderer content={scholar.bio || "Biography details not available."} />
          </div>
        </div>

        <div className="space-y-8">
          {scholar.notable_works && scholar.notable_works.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold font-serif text-xl flex items-center gap-2 mb-4 text-foreground">
                <BookOpen size={18} className="text-primary" /> Notable Works
              </h3>
              <ul className="space-y-3 text-sm text-muted">
                {scholar.notable_works.map((work: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">&rsaquo;</span> <span className="font-serif text-base text-foreground">{work}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {books && books.length > 0 && (
        <section className="mb-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold font-serif mb-8 text-foreground text-center">Books by {scholar.name_english}</h2>
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
