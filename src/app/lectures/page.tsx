import Link from "next/link";
import { Video, ChevronRight, Clock, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import SaveButton from "@/components/SaveButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Islamic Lectures & Video Series",
  description:
    "Watch curated Islamic lectures, bayaans, and educational video series from leading Sunni scholars on topics of Aqeedah, Fiqh, and spirituality.",
};

export const revalidate = 60;

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function LecturesPage(props: { searchParams: Promise<{ category?: string; channel?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const currentCategory = searchParams.category || "";
  const currentChannel = searchParams.channel || "";
  const searchQuery = searchParams.q || "";

  // 1. Fetch categories
  const { data: categoryData } = await supabase
    .from("categories")
    .select("name")
    .or("content_type.eq.lectures,content_type.is.null")
    .order("name", { ascending: true });

  const CATEGORIES = categoryData?.map((c) => c.name) || [];

  // 2. Fetch channels
  const { data: channelData } = await supabase
    .from("lectures")
    .select("speaker")
    .eq("category", "YouTube Sync");
  
  const CHANNELS = Array.from(new Set(channelData?.map((c) => c.speaker).filter(Boolean))) as string[];

  // 3. Main query
  let query = supabase.from("lectures").select("*").eq("status", "published").order("created_at", { ascending: false });

  if (currentChannel) {
    query = query.eq("speaker", currentChannel).eq("category", "YouTube Sync");
  } else if (currentCategory) {
    query = query.eq("category", currentCategory);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: lectures } = await query;

  const renderLectureCard = (lecture: any) => {
    const ytId = getYouTubeId(lecture.embed_url);
    return (
      <div key={lecture.id} className="bg-card border border-border rounded-xl hover:shadow-md transition-shadow flex flex-col overflow-hidden relative group h-full">
        <AdminEditButton id={lecture.id} type="lectures" />
        <div className="aspect-video bg-muted/20 relative flex items-center justify-center shrink-0">
          {ytId ? (
            <a 
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full h-full relative block"
            >
              <img 
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                alt={lecture.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white">
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            </a>
          ) : lecture.embed_url ? (
            <iframe 
              src={lecture.embed_url} 
              className="w-full h-full border-0 pointer-events-none"
              allowFullScreen 
            />
          ) : (
            <Video size={48} className="text-muted/50" />
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-primary/80 mb-2 uppercase">
            {lecture.category === 'YouTube Sync' ? 'YOUTUBE SYNC' : `LECTURE ${lecture.category ? `• ${lecture.category}` : ''}`}
          </span>
          <h3 className="font-bold text-[1.05rem] leading-snug text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {lecture.title}
          </h3>
          <p className="text-muted text-sm line-clamp-2 mb-4 flex-1">
            {lecture.description || "No description provided."}
          </p>
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

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 max-w-7xl">
      {/* Sidebar - 25% */}
      <aside className="w-full md:w-1/4 shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-muted mb-4 uppercase">
          Categories
        </h2>
        <ul className="space-y-1 mb-8">
          <li>
            <Link
              href="/lectures"
              className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                !currentCategory && !currentChannel
                  ? "bg-primary text-card font-semibold"
                  : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              All Lectures
            </Link>
          </li>
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <li key={cat}>
                <Link
                  href={`/lectures?category=${encodeURIComponent(cat)}`}
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

        {CHANNELS.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-muted mb-4 uppercase flex items-center justify-between">
              <span>YouTube Sync</span>
              <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Auto</span>
            </h2>
            <ul className="space-y-1">
              {CHANNELS.map((channel) => {
                const isActive = currentChannel === channel;
                return (
                  <li key={channel}>
                    <Link
                      href={`/lectures?channel=${encodeURIComponent(channel)}`}
                      className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-card font-semibold"
                          : "text-muted hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      {channel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content - 75% */}
      <main className="w-full md:w-3/4">
        <div className="flex items-center text-sm text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-1" />
          {currentCategory || currentChannel ? (
            <>
              <Link href="/lectures" className="hover:text-primary transition-colors">Lectures</Link>
              <ChevronRight size={14} className="mx-1" />
              <span className="text-foreground font-medium">
                {currentCategory || currentChannel}
              </span>
            </>
          ) : (
            <span className="text-foreground font-medium">Lectures</span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4 w-full">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary">
            <Video size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif text-foreground">
              {currentCategory || currentChannel || "Lectures & Series"}
            </h1>
            {(currentCategory || currentChannel) && (
              <p className="text-sm text-muted mt-0.5">
                {currentChannel ? "YouTube Channel Sync" : "Lectures"}
              </p>
            )}
          </div>
          <AdminAddButton type="lectures" label="Add Lecture" />
        </div>

        {/* Search Bar */}
        <form method="GET" action="/lectures" className="relative mb-8">
          {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
          {currentChannel && <input type="hidden" name="channel" value={currentChannel} />}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search lectures..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Lecture List */}
        {(!lectures || lectures.length === 0) ? (
          <div className="py-12 text-center text-muted">
            No lectures found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map(renderLectureCard)}
          </div>
        )}
      </main>
    </div>
  );
}
