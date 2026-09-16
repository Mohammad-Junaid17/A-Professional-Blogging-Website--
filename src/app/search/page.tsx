import Link from "next/link";
import { Search, ChevronRight, Video, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ArticleCard, BookCard, ScholarCard } from "@/components/ui/Cards";
import { QACard } from "@/components/ui/QACard";
import SaveButton from "@/components/SaveButton";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across articles, books, scholars, Q&A, and lectures on Islam360.",
};

function getYouTubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

function buildDiacriticRegex(query: string) {
  // Escape regex special characters
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Mapping of common English letters to their transliterated diacritic forms
  const map: Record<string, string> = {
    'a': '[aāAĀ]',
    'i': '[iīIĪ]',
    'u': '[uūUŪ]',
    's': '[sṣśšSṢŚŠ]',
    'd': '[dḍDḌ]',
    't': '[tṭTṬ]',
    'z': '[zẓZẒ]',
    'h': '[hḥHḤ]'
  };
  
  // Replace plain letters with their diacritic equivalents
  const withDiacritics = escaped.replace(/[aiusdtzh]/ig, (match) => map[match.toLowerCase()] || match);
  
  return `.*${withDiacritics}.*`;
}

const renderLectureCard = (lecture: any) => {
  const ytId = getYouTubeId(lecture.embed_url);
  return (
    <div key={lecture.id} className="bg-card border border-border rounded-xl hover:shadow-md transition-shadow flex flex-col overflow-hidden relative group h-full">
      <AdminEditButton id={lecture.id} type="lectures" />
      <div className="aspect-video bg-muted/20 relative flex items-center justify-center shrink-0">
        {ytId ? (
          <a href={`https://www.youtube.com/watch?v=${ytId}`} target="_blank" rel="noopener noreferrer" className="w-full h-full relative block">
            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={lecture.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          </a>
        ) : lecture.embed_url ? (
          <iframe src={lecture.embed_url} className="w-full h-full border-0 pointer-events-none" allowFullScreen />
        ) : (
          <Video size={48} className="text-muted/50" />
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[10px] font-bold tracking-widest text-primary/80 mb-2 uppercase">
          {lecture.category === "YouTube Sync" ? "YOUTUBE SYNC" : `LECTURE ${lecture.category ? `• ${lecture.category}` : ""}`}
        </span>
        <h3 className="font-bold text-[1.05rem] leading-snug text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">{lecture.title}</h3>
        <p className="text-muted text-sm line-clamp-2 mb-4 flex-1">{lecture.description || "No description provided."}</p>
        <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-border/50 mt-auto">
          <span className="text-primary truncate max-w-[60%]">{lecture.speaker || "Unknown"}</span>
          <div className="flex items-center gap-3 shrink-0">
            {lecture.duration && <span className="flex items-center gap-1"><Clock size={12} /> {lecture.duration}</span>}
            <SaveButton contentType="lecture" contentId={lecture.id} iconOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const query = searchParams.q || "";

  // Perform parallel searches if query exists
  let articles: any[] = [], books: any[] = [], scholars: any[] = [], qa: any[] = [], lectures: any[] = [];
  
  if (query) {
    const regexQuery = buildDiacriticRegex(query);
    const safeOrRegex = `"${regexQuery.replace(/"/g, '""')}"`;

    // 1. Search translations first for Urdu (or any translated) matches
    const { data: tm } = await supabase
      .from("translations")
      .select("content_id, content_type")
      .ilike("content", `%${query}%`)
      .limit(50);
      
    const tIds: Record<string, string[]> = { article: [], books: [], scholars: [], qa: [], contentions: [] };
    if (tm) {
      tm.forEach((t) => {
        if (tIds[t.content_type]) {
          tIds[t.content_type].push(t.content_id);
        }
      });
    }

    const orStr = (baseOr: string, type: string) => {
      const ids = tIds[type];
      return ids && ids.length > 0 ? `${baseOr},id.in.(${ids.join(',')})` : baseOr;
    };
    
    const [articlesRes, booksRes, scholarsRes, qaRes, lecturesRes] = await Promise.all([
      supabase.from("articles").select("*").or(orStr(`title.imatch.${safeOrRegex}`, 'article')).limit(10),
      supabase.from("books").select("*").or(orStr(`title.imatch.${safeOrRegex}`, 'books')).limit(10),
      supabase.from("scholars").select("*").or(orStr(`name_english.imatch.${safeOrRegex}`, 'scholars')).limit(10),
      supabase.from("qa_entries").select("*").or(orStr(`question.imatch.${safeOrRegex},answer.imatch.${safeOrRegex}`, 'qa')).eq("status", "answered").limit(10),
      supabase.from("lectures").select("*").filter("title", "imatch", regexQuery).limit(10)
    ]);
    articles = articlesRes.data || [];
    books = booksRes.data || [];
    scholars = scholarsRes.data || [];
    qa = qaRes.data || [];
    lectures = lecturesRes.data || [];
  }

  const totalResults = articles.length + books.length + scholars.length + qa.length + lectures.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[60vh]">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Search</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary">
          <Search size={24} />
        </div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Search</h1>
      </div>

      <form method="GET" action="/search" className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={24} />
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search across articles, books, Q&A, scholars, and lectures..."
          className="w-full pl-14 pr-4 py-4 bg-card border-2 border-border rounded-xl text-lg text-foreground focus:outline-none focus:border-primary transition-colors"
          autoFocus
        />
        <button type="submit" className="hidden">Search</button>
      </form>

      {query && (
        <div className="mb-8 border-b border-border pb-4">
          <p className="font-medium text-foreground">
            {totalResults} result(s) found for "{query}"
          </p>
        </div>
      )}

      {query && totalResults === 0 && (
        <div className="text-center py-16 text-muted bg-card border border-border rounded-xl">
          <Search size={48} className="mx-auto text-muted/30 mb-4" />
          <p className="text-lg">No results found matching your search.</p>
          <p className="text-sm mt-2">Try different keywords or check your spelling.</p>
        </div>
      )}

      <div className="space-y-12 max-w-6xl">
        {qa.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full text-sm">Q&A</span>
              Questions & Answers
            </h2>
            <div className="space-y-4">
              {qa.map(q => <QACard key={`qa-${q.id}`} qa={q} />)}
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Articles</span>
              Articles & Essays
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => <ArticleCard key={`article-${a.id}`} article={a} />)}
            </div>
          </div>
        )}

        {books.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-[#C9A84C]/10 text-[#C9A84C] px-3 py-1 rounded-full text-sm">Books</span>
              Books & Publications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map(b => <BookCard key={`book-${b.id}`} book={b} />)}
            </div>
          </div>
        )}

        {scholars.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-teal-600/10 text-teal-600 px-3 py-1 rounded-full text-sm">Scholars</span>
              Scholar Biographies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholars.map(s => <ScholarCard key={`scholar-${s.id}`} scholar={s} />)}
            </div>
          </div>
        )}

        {lectures.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-red-600/10 text-red-600 px-3 py-1 rounded-full text-sm">Lectures</span>
              Audio & Video Lectures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map(renderLectureCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
