import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, FileText, HelpCircle } from "lucide-react";
import { ArticleCard, BookCard, ScholarCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";
import { WebSiteSchema } from "@/components/JsonLd";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch initial data
  const { data: articles } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(3);
  const { data: books } = await supabase.from('books').select('*').order('created_at', { ascending: false }).limit(3);
  const { data: scholars } = await supabase.from('scholars').select('*').order('created_at', { ascending: false }).limit(3);

  return (
    <div className="flex flex-col min-h-screen">
      <WebSiteSchema />
      {/* SECTION 1 - Hero */}
      <section className="relative pt-8 pb-20 md:pt-12 md:pb-32 overflow-hidden flex items-center justify-center">
        {/* Subtle background pattern could go here */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
          <h1 className="sr-only">Islam360 — Encyclopaedia of Sunni Islam, Aqeedah, Fiqh & Scholarly Tradition</h1>
          <div className="mb-8 inline-flex flex-col items-center justify-center space-y-2 opacity-90 hover:opacity-100 transition-opacity">
            <div className="h-24 sm:h-32 mb-3 flex items-center justify-center relative w-full max-w-[200px] mx-auto">
              <Image 
                src="/MuftieAzam.png" 
                alt="Mufti e Azam Hind — Imam Mustafa Rida Khan, patron scholar of Islam360" 
                fill
                priority
                className="object-contain brightness-0 dark:brightness-0 dark:invert opacity-90 dark:opacity-100" 
              />
            </div>
            <span className="text-sm font-bold tracking-[0.2em] text-primary uppercase border-b border-primary/20 pb-1.5">
              A Mere Servant of <span className="text-accent">Noori</span>
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-muted">
              <span className="text-[13px] font-semibold tracking-widest uppercase mt-0.5">
                Imām Muṣṭafā Riḍā Khān Nūrī
              </span>
              <span className="font-amiri text-xl text-accent font-medium" dir="rtl" lang="ar">
                رضي الله عنه
              </span>
            </div>
          </div>
          <div className="text-center text-lg md:text-xl text-foreground/90 font-serif leading-relaxed max-w-4xl mx-auto mb-10 space-y-6">
            <p>Asalāmu Álaykum wa raHmatullah</p>
            <p>
              Welcome to Islam360! The aim and mission of this website is to propagate the correct Áqaýed (beliefs) and
              Manhaj (teachings) of the Ahl as-Sunnah wa al-Jamaáh as written in the works of the great Imām of the Ahl as-Sunnah,
              and revivalist of the 14th century, <strong className="text-foreground">Ala Hazrat</strong> <span className="text-[#9CC76D]">Imam Ahmed Rida al-Qadri</span> rahīmahullāh wa rađiyAllāhu ánh.
            </p>
            <p>
              The site mainly concentrates in bringing the teachings of the maslak (path) of Imam Ahmed RiDa al-Qadri
              rahimahullah to the English speaking masses, and In-shaáAllah with your help, we will fulfil this aim.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/articles" className="w-full sm:w-auto px-8 py-3 bg-primary text-card font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              Explore Articles
            </Link>
            <Link href="/qa" className="w-full sm:w-auto px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
              Ask Q&A
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 2 - Browse by Category */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard 
              href="/articles" 
              icon={<FileText size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />} 
              title="Articles & Essays" 
              description="Deep dives into foundational topics and contemporary matters." 
            />
            <CategoryCard 
              href="/books" 
              icon={<BookOpen size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />} 
              title="Library" 
              description="Explore classical and contemporary books and treatises." 
            />
            <CategoryCard 
              href="/qa" 
              icon={<HelpCircle size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />} 
              title="Q&A" 
              description="Ask questions and find answers on various Islamic topics." 
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 - Recent Articles */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-end mb-10 border-b border-border pb-4">
            <h2 className="text-3xl font-bold font-serif text-foreground">Recent Articles</h2>
            <Link href="/articles" className="text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col space-y-6">
            {articles && articles.length > 0 ? (
              articles.map((article) => <ArticleCard key={article.id} article={article} />)
            ) : (
              <p className="text-muted text-center py-10">No articles available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4 - Two Column Layout */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Library Column */}
            <div>
              <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
                <h2 className="text-2xl font-bold font-serif text-foreground">From the Library</h2>
                <Link href="/books" className="text-primary font-medium hover:underline flex items-center gap-1 text-sm">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {books && books.length > 0 ? (
                  books.map((book) => <BookCard key={book.id} book={book} />)
                ) : (
                  <p className="text-muted text-center py-4">No books available yet.</p>
                )}
              </div>
            </div>

            {/* Scholars Column */}
            <div>
              <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
                <h2 className="text-2xl font-bold font-serif text-foreground">Renowned Scholars</h2>
                <Link href="/scholars" className="text-primary font-medium hover:underline flex items-center gap-1 text-sm">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex flex-col space-y-4">
                {scholars && scholars.length > 0 ? (
                  scholars.map((scholar) => <ScholarCard key={scholar.id} scholar={scholar} />)
                ) : (
                  <p className="text-muted text-center py-4">No scholars available yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>



    </div>
  );
}

function CategoryCard({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-background border border-border p-6 rounded-xl hover:shadow-md transition-all group-hover:border-primary/30 h-full flex flex-col items-center text-center">
        {icon}
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </Link>
  );
}
