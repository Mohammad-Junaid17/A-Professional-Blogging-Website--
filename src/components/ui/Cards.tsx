/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { User, ArrowRight, Book } from "lucide-react";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

export function ArticleCard({ article }: { article: any }) {
  return (
    <div className="relative h-full group">
      <AdminEditButton id={article.id} type="articles" returnUrl={article.category ? `/articles?category=${encodeURIComponent(article.category)}` : `/articles`} />
      {article.redirect_url ? (
        <a href={article.redirect_url} target="_blank" rel="noopener noreferrer" className="block h-full">
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
        </a>
      ) : (
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
      )}
    </div>
  );
}

export function BookCard({ book }: { book: any }) {
  return (
    <div className="relative h-full group">
      <AdminEditButton id={book.id} type="books" />
      <Link href={`/books/${book.slug}`} className="block h-full">
        <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow h-full flex flex-col">
          <span className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">
            Book {book.category && `• ${book.category}`} {book.language && `• ${book.language}`}
          </span>
          <h3 className="font-bold text-[1.1rem] text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-muted text-sm line-clamp-3 mb-4 flex-1">
            {book.description || "No description provided."}
          </p>
          <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50">
            <span className="text-primary truncate max-w-[60%]">{book.author || "Unknown"}</span>
            <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
              View Details <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ScholarCard({ scholar }: { scholar: any }) {
  return (
    <div className="relative h-full group">
      <AdminEditButton id={scholar.id} type="scholars" returnUrl="/scholars" />
      <Link href={`/scholars/${scholar.slug}`} className="block h-full">
        <div className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow h-full flex flex-col">
          {scholar.madhab && (
            <span className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">
              {scholar.madhab}
            </span>
          )}
          <h3 className="font-bold text-[1.1rem] text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {scholar.name_english}
          </h3>
          <p className="text-muted text-sm line-clamp-3 mb-4 flex-1">
            {scholar.bio || "No biography provided."}
          </p>
          <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50">
            <span className="text-primary truncate max-w-[60%]">d. {scholar.death_year_ah} AH</span>
            <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
              View Profile <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}


