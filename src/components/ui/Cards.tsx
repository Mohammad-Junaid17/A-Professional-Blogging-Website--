/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { User, ArrowRight, Book } from "lucide-react";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export function ArticleCard({ article }: { article: any }) {
  const CardContent = () => (
    <div className="group block bg-card border border-border p-6 rounded-xl hover:shadow-sm transition-all h-full flex flex-col justify-center relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {article.category && (
            <span className="bg-background px-3 py-1 rounded-full text-xs font-bold tracking-wider text-muted uppercase">
              {article.category}
            </span>
          )}
          <span className="text-sm text-muted">
            {new Date(article.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted group-hover:text-primary transition-colors">
          <span>{article.reading_time || 5} min read</span>
          <ArrowRight size={16} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      
      <h3 className="text-2xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      
      <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed max-w-4xl">
        {article.excerpt || article.content?.substring(0, 200) + "..."}
      </p>
      
      <div className="text-sm text-muted font-medium">
        {article.author || "Unknown Author"}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <AdminEditButton id={article.id} type="articles" returnUrl={article.category ? `/articles?category=${encodeURIComponent(article.category)}` : `/articles`} />
      {article.redirect_url ? (
        <a href={article.redirect_url} target="_blank" rel="noopener noreferrer" className="block w-full">
          <CardContent />
        </a>
      ) : (
        <Link href={`/articles/${article.slug}`} className="block w-full">
          <CardContent />
        </Link>
      )}
    </div>
  );
}

export function BookCard({ book }: { book: any }) {
  const CardContent = () => (
    <div className="group block bg-card border border-border p-5 rounded-xl hover:shadow-sm transition-all h-full flex flex-col justify-center relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <span className="bg-background px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-muted uppercase">
            Book {book.category && `• ${book.category}`}
          </span>
          {book.language && (
            <span className="text-xs text-muted font-medium uppercase tracking-wider">
              {book.language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted group-hover:text-primary transition-colors">
          <span>View Details</span>
          <ArrowRight size={14} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      
      <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {book.title}
      </h3>
      
      <p className="text-muted text-sm line-clamp-2 mb-3 leading-relaxed max-w-4xl">
        {book.description || "No description provided."}
      </p>
      
      <div className="text-sm text-muted font-medium">
        {book.author || "Unknown Author"}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <AdminEditButton id={book.id} type="books" />
      <Link href={`/books/${book.slug}`} className="block w-full">
        <CardContent />
      </Link>
    </div>
  );
}

export function ScholarCard({ scholar }: { scholar: any }) {
  const CardContent = () => (
    <div className="group block bg-card border border-border p-5 rounded-xl hover:shadow-sm transition-all h-full flex flex-col justify-center relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          {scholar.madhab && (
            <span className="bg-background px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-muted uppercase">
              {scholar.madhab}
            </span>
          )}
          {scholar.death_year_ah && (
            <span className="text-xs text-muted font-medium">
              d. {scholar.death_year_ah} AH
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted group-hover:text-primary transition-colors">
          <span>View Profile</span>
          <ArrowRight size={14} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      
      <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {scholar.name_english}
      </h3>
      
      <p className="text-muted text-sm line-clamp-2 leading-relaxed max-w-4xl">
        {scholar.bio || "No biography provided."}
      </p>
    </div>
  );

  return (
    <div className="relative w-full">
      <AdminEditButton id={scholar.id} type="scholars" returnUrl="/scholars" />
      <Link href={`/scholars/${scholar.slug}`} className="block w-full">
        <CardContent />
      </Link>
    </div>
  );
}
