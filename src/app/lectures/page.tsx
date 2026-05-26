import Link from "next/link";
import { Video, ChevronRight, Clock, User, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminAddButton } from "@/components/admin/AdminAddButton";

export const revalidate = 60;

export default async function LecturesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const searchQuery = searchParams.q || "";

  let query = supabase.from("lectures").select("*").eq("status", "published").order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: lectures } = await query;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Lectures</span>
      </div>

      <div className="flex items-center gap-3 mb-10 w-full">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary">
          <Video size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Lectures & Series</h1>
          <p className="text-muted mt-1">Audio and video recordings of lessons and sermons.</p>
        </div>
        <AdminAddButton type="lectures" label="Add Lecture" />
      </div>

      <form method="GET" action="/lectures" className="relative mb-10 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search lectures..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures && lectures.length > 0 ? (
          lectures.map((lecture) => (
            <div key={lecture.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              
              {/* Video Thumbnail Placeholder / Embed */}
              <div className="aspect-video bg-muted/20 relative flex items-center justify-center">
                {lecture.embed_url ? (
                  <iframe 
                    src={lecture.embed_url} 
                    className="w-full h-full border-0"
                    allowFullScreen 
                  />
                ) : (
                  <Video size={48} className="text-muted/50" />
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  {lecture.category && (
                    <span className="bg-nav-active text-primary text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full">
                      {lecture.category}
                    </span>
                  )}
                  {lecture.duration && (
                    <span className="flex items-center gap-1 text-xs text-muted font-medium ml-auto">
                      <Clock size={12} /> {lecture.duration}
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                  {lecture.title}
                </h3>
                
                <p className="text-sm text-muted mb-4 flex-1 line-clamp-3">
                  {lecture.description}
                </p>
                
                <div className="flex items-center gap-1 text-sm font-medium text-foreground pt-4 border-t border-border/50">
                  <User size={16} className="text-primary" />
                  {lecture.speaker}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted">
            No lectures available yet.
          </div>
        )}
      </div>
    </div>
  );
}
