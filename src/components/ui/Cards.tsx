/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { User, Quote as QuoteIcon, ArrowRight, Book } from "lucide-react";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export function ArticleCard({ article }: { article: any }) {
  return (
    <div className="relative h-full group">
      <AdminEditButton id={article.id} type="articles" />
      <Link href={`/articles/${article.slug}`} className="block h-full">
        <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow h-full flex flex-col">
        <span className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">Article</span>
        <h3 className="font-bold text-[1.1rem] text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-muted text-sm line-clamp-3 mb-4 flex-1">
          {article.excerpt || article.content?.substring(0, 150) + "..."}
        </p>
        <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50">
          <span className="text-primary truncate max-w-[60%]">{article.author}</span>
          <span>{article.reading_time || 5} min read</span>
        </div>
        </div>
      </Link>
    </div>
  );
}

export function BookCard({ book }: { book: any }) {
  return (
    <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow flex gap-4 h-full relative group">
      <AdminEditButton id={book.id} type="books" />
      <div className="flex-shrink-0">
        {book.cover_url ? (
          <div 
            className="w-16 h-24 bg-cover bg-center rounded shadow-sm border border-border"
            style={{ backgroundImage: `url(${book.cover_url})` }}
          />
        ) : (
          <div className="w-16 h-24 bg-primary-light rounded shadow-sm border border-border flex items-center justify-center text-primary">
            <Book size={28} />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-foreground mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-muted mb-2">{book.author}</p>
        <div className="flex gap-2 mb-2">
          {book.category && (
            <span className="text-[10px] bg-nav-active text-primary px-2 py-1 rounded-full font-semibold uppercase tracking-wider">
              {book.category}
            </span>
          )}
          {book.language && (
            <span className="text-[10px] bg-border text-foreground px-2 py-1 rounded-full font-semibold uppercase tracking-wider">
              {book.language}
            </span>
          )}
        </div>
        <p className="text-sm text-muted line-clamp-2 mb-3 flex-1">{book.description}</p>
        <div className="mt-auto">
          <Link href={`/books/${book.slug}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ScholarCard({ scholar }: { scholar: any }) {
  return (
    <div className="relative h-full group">
      <AdminEditButton id={scholar.id} type="scholars" />
      <Link href={`/scholars/${scholar.slug}`} className="block h-full">
        <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-card">
            <User size={24} />
          </div>
          <span className="text-sm text-muted">d. {scholar.death_year_ah} AH</span>
        </div>
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
          {scholar.name_english}
        </h3>
        {scholar.name_arabic && (
          <p className="font-amiri text-xl text-primary mb-2 text-right">{scholar.name_arabic}</p>
        )}
        {scholar.madhab && (
          <span className="inline-block bg-nav-active text-primary text-xs font-semibold px-2 py-1 rounded-full mb-3">
            {scholar.madhab}
          </span>
        )}
        <p className="text-sm text-muted line-clamp-3">
          {scholar.bio}
        </p>
        </div>
      </Link>
    </div>
  );
}

export function QuoteCard({ quote }: { quote: any }) {
  return (
    <div className="bg-card border border-border p-6 rounded-xl relative h-full flex flex-col group">
      <AdminEditButton id={quote.id} type="quotes" />
      <QuoteIcon size={32} className="text-accent absolute top-4 left-4 opacity-50" />
      <div className="pt-6 flex-1 flex flex-col items-center text-center">
        <p className="font-amiri text-2xl md:text-3xl text-primary leading-relaxed mb-4 w-full" dir="rtl">
          {quote.arabic_text}
        </p>
        <p className="text-muted italic mb-6">
          &quot;{quote.english_text}&quot;
        </p>
      </div>
      <div className="mt-auto pt-4 border-t border-border/50 text-center">
        <p className="font-semibold text-foreground text-sm">— {quote.attribution}</p>
        {quote.source && (
          <p className="text-xs text-muted mt-1">{quote.source}</p>
        )}
      </div>
    </div>
  );
}
