import Link from "next/link";
import { MapPin, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/ui/Cards";
import { TranslationWrapper } from "@/components/TranslationWrapper";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import SaveButton from "@/components/SaveButton";
import { PersonSchema, BreadcrumbSchema } from "@/components/JsonLd";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: scholar } = await supabase
    .from("scholars")
    .select("name_english, bio, madhab, origin")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!scholar) {
    return { title: "Scholar Not Found" };
  }

  const description =
    scholar.bio?.substring(0, 160) ||
    `Biography of ${scholar.name_english} — a renowned ${scholar.madhab || "Sunni"} scholar${scholar.origin ? ` from ${scholar.origin}` : ""}.`;

  return {
    title: `${scholar.name_english} — Biography`,
    description,
    openGraph: {
      title: `${scholar.name_english} — Biography`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${scholar.name_english} — Biography`,
      description,
    },
  };
}

export default async function ScholarPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: scholar } = await supabase
    .from("scholars")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!scholar) notFound();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .ilike("author", `%${scholar.name_english}%`)
    .limit(4);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <PersonSchema
        name={scholar.name_english}
        slug={scholar.slug}
        description={scholar.bio?.substring(0, 200) || `Biography of ${scholar.name_english}`}
        birthDate={scholar.birth_year}
        deathDate={scholar.death_year_ah ? `${scholar.death_year_ah} AH` : undefined}
        birthPlace={scholar.origin}
        image={scholar.image_url}
        notableWorks={scholar.notable_works}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://islam360.ridawiway.com" },
          { name: "Scholars", url: "https://islam360.ridawiway.com/scholars" },
          { name: scholar.name_english, url: `https://islam360.ridawiway.com/scholars/${scholar.slug}` },
        ]}
      />
      <AdminEditButton id={scholar.id} type="scholars" returnUrl={`/scholars/${scholar.slug}`} />

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-1">&rsaquo;</span>
        <Link href="/scholars" className="hover:text-primary transition-colors">Scholars</Link>
        <span className="mx-1">&rsaquo;</span>
        <span className="text-foreground font-medium truncate">{scholar.name_english}</span>
      </div>

      {/* Header — avatar left, info right */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 mb-10 border-b border-border">
        
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0 overflow-hidden border-2 border-black/20 dark:border-white/20 bg-primary/10 flex items-center justify-center">
          {scholar.image_url ? (
            <img
              src={scholar.image_url}
              alt={scholar.name_english}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-primary font-serif select-none">
              {scholar.name_english?.charAt(0) ?? "S"}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          {scholar.madhab && (
            <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
              {scholar.madhab}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground leading-snug mb-1">
            {scholar.name_english}
          </h1>
          {scholar.name_arabic && (
            <p className="font-amiri text-xl text-primary mb-3" dir="rtl">
              {scholar.name_arabic}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-sm text-muted">
            {scholar.birth_year && (
              <span>Born: <span className="font-medium text-foreground">{scholar.birth_year}</span></span>
            )}
            {scholar.birth_year && scholar.death_year_ah && <span>·</span>}
            {scholar.death_year_ah && (
              <span>Died: <span className="font-medium text-foreground">{scholar.death_year_ah} AH</span></span>
            )}
            {scholar.origin && (scholar.birth_year || scholar.death_year_ah) && <span>·</span>}
            {scholar.origin && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-primary" />
                {scholar.origin}
              </span>
            )}
          </div>
          <div className="mt-4 flex justify-center sm:justify-start">
            <SaveButton contentType="scholar" contentId={scholar.id} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div className="md:col-span-2">
          <TranslationWrapper 
            originalContent={scholar.bio || "Biography details not available."}
            contentType="scholars"
            contentId={scholar.id}
          />
        </div>

        <div className="space-y-6">
          {scholar.notable_works && scholar.notable_works.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold font-serif text-base flex items-center gap-2 mb-4 text-foreground">
                <BookOpen size={16} className="text-primary" /> Notable Works
              </h3>
              <ul className="space-y-2">
                {scholar.notable_works.map((work: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">&rsaquo;</span>
                    <span className="font-serif text-foreground">{work}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {books && books.length > 0 && (
        <section className="mb-16 pt-10 border-t border-border">
          <h2 className="text-xl font-bold font-serif mb-6 text-foreground">
            Books by {scholar.name_english}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      <CommentSection contentType="scholar" contentId={scholar.id} />
    </div>
  );
}
