import Link from "next/link";
import { ArrowRight, BookOpen, Users, FileText, Quote as QuoteIcon } from "lucide-react";
import { ArticleCard, BookCard, ScholarCard } from "@/components/ui/Cards";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch initial data
  const { data: articles } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(3);
  const { data: books } = await supabase.from('books').select('*').limit(3);
  const { data: scholars } = await supabase.from('scholars').select('*').limit(3);
  const { data: quotes } = await supabase.from('quotes').select('*').limit(1);

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1 - Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden flex items-center justify-center">
        {/* Subtle background pattern could go here */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
          <div className="mb-8 inline-flex flex-col items-center justify-center space-y-2 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-sm font-bold tracking-[0.2em] text-primary uppercase border-b border-primary/20 pb-1.5">
              A Mere Servant of <span className="text-accent">Noori</span>
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-muted">
              <span className="text-[13px] font-semibold tracking-widest uppercase mt-0.5">
                Imām Muṣṭafā Riḍā Khān Nūrī
              </span>
              <span className="font-amiri text-xl text-accent font-medium" dir="rtl">
                رضي الله عنه
              </span>
            </div>
          </div>
          <div className="text-left md:text-center text-lg md:text-xl text-gray-700 dark:text-gray-300 font-serif leading-relaxed max-w-4xl mx-auto mb-10 space-y-6">
            <p>Asalāmu Álaykum wa raHmatullah</p>
            <p>
              Welcome to Islamic Scholarly Resource! The aim and mission of this website is to propagate the correct Áqaýed (beliefs) and
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
            <Link href="/books" className="w-full sm:w-auto px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
              Browse Library
            </Link>
          </div>
          <div className="mt-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <span className="text-xs text-muted font-bold uppercase tracking-[0.2em]">Follow Our Updates</span>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <a href="https://x.com/sugemadinah" target="_blank" rel="noopener noreferrer" className="p-3 bg-background/50 backdrop-blur-sm border border-border rounded-full hover:bg-primary/10 hover:border-primary/30 hover:scale-110 transition-all group" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-hover:text-primary transition-colors">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                  </svg>
                </a>
                <a href="https://www.instagram.com/q.sunnahh_/" target="_blank" rel="noopener noreferrer" className="p-3 bg-background/50 backdrop-blur-sm border border-border rounded-full hover:bg-primary/10 hover:border-primary/30 hover:scale-110 transition-all group" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-hover:text-primary transition-colors">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
              <span className="text-[11px] text-muted/80 italic">Curated by @q.sunnahh_</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - Browse by Category */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              href="/scholars" 
              icon={<Users size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />} 
              title="Biographies" 
              description="Learn about the lives and works of traditional scholars." 
            />
            <CategoryCard 
              href="/quotes" 
              icon={<QuoteIcon size={32} className="text-primary mb-4 group-hover:scale-110 transition-transform" />} 
              title="Quotes" 
              description="Inspirational wisdom from the Quran, Sunnah, and scholars." 
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles && articles.length > 0 ? (
              articles.map((article) => <ArticleCard key={article.id} article={article} />)
            ) : (
              <p className="text-muted col-span-3 text-center py-10">No articles available yet.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scholars && scholars.length > 0 ? (
                  scholars.map((scholar) => <ScholarCard key={scholar.id} scholar={scholar} />)
                ) : (
                  <p className="text-muted col-span-2 text-center py-4">No scholars available yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5 - Quote of the Moment */}
      {quotes && quotes.length > 0 && (
        <section className="py-24 bg-card border-y border-border flex items-center justify-center">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h2 className="text-xl font-bold tracking-widest uppercase text-muted mb-8">Quote of the Moment</h2>
            <div className="mb-6">
              <QuoteIcon size={48} className="mx-auto text-accent mb-6" />
              <p className="font-amiri text-3xl md:text-4xl text-primary leading-loose mb-6" dir="rtl">
                {quotes[0].arabic_text}
              </p>
              <p className="text-lg md:text-xl text-muted italic mb-8 max-w-2xl mx-auto">
                &quot;{quotes[0].english_text}&quot;
              </p>
              <p className="font-bold text-foreground text-lg">— {quotes[0].attribution}</p>
              {quotes[0].source && <p className="text-sm text-muted mt-2">{quotes[0].source}</p>}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6 - Newsletter */}
      <section className="py-20 bg-nav-active border-b border-border">
        <div className="container px-4 mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Stay Updated</h2>
          <p className="text-muted mb-8">
            Subscribe for updates on new articles, books, and scholarly content.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button 
              type="submit"
              className="bg-primary text-card px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
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
