/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase-admin";
import { FileText, BookOpen, Users, Quote, HelpCircle, MessageSquare, Mail, UserCheck, Activity } from "lucide-react";
import Link from "next/link";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";

async function getDashboardStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [articles, books, scholars, quotes, pendingQA, pendingComments, newsletter, users, pageViewsResponse] = await Promise.all([
    supabaseAdmin.from("articles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("books").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("scholars").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("quotes").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("qa_entries").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("page_views").select("created_at").gte("created_at", thirtyDaysAgo.toISOString())
  ]);

  const pageViews = pageViewsResponse.data || [];
  
  // Calculate views today
  const viewsToday = pageViews.filter(v => new Date(v.created_at) >= today).length;

  // Group by date for the chart
  const viewsByDate = pageViews.reduce((acc: Record<string, number>, view) => {
    const date = new Date(view.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Generate last 7 days array to ensure empty days are shown
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    chartData.push({
      date: dateStr,
      views: viewsByDate[dateStr] || 0
    });
  }

  return {
    articles: articles.count ?? 0,
    books: books.count ?? 0,
    scholars: scholars.count ?? 0,
    quotes: quotes.count ?? 0,
    pendingQA: pendingQA.count ?? 0,
    pendingComments: pendingComments.count ?? 0,
    newsletter: newsletter.count ?? 0,
    users: users.count ?? 0,
    totalViews: pageViews.length,
    viewsToday,
    chartData
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statItems = [
    { label: "Views Today", count: stats.viewsToday, icon: Activity, href: "/admin", color: "text-green-500 bg-green-500/10" },
    { label: "Views (30d)", count: stats.totalViews, icon: Activity, href: "/admin", color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Articles", count: stats.articles, icon: FileText, href: "/admin/articles", color: "text-blue-500 bg-blue-500/10" },
    { label: "Books", count: stats.books, icon: BookOpen, href: "/admin/books", color: "text-teal-500 bg-teal-500/10" },
    { label: "Scholars", count: stats.scholars, icon: Users, href: "/admin/scholars", color: "text-purple-500 bg-purple-500/10" },
    { label: "Quotes", count: stats.quotes, icon: Quote, href: "/admin/quotes", color: "text-amber-500 bg-amber-500/10" },
    { label: "Pending Q&A", count: stats.pendingQA, icon: HelpCircle, href: "/admin/qa", color: "text-orange-500 bg-orange-500/10" },
    { label: "Pending Comments", count: stats.pendingComments, icon: MessageSquare, href: "/admin/comments", color: "text-rose-500 bg-rose-500/10" },
    { label: "Newsletter", count: stats.newsletter, icon: Mail, href: "/admin/newsletter", color: "text-cyan-500 bg-cyan-500/10" },
    { label: "Users", count: stats.users, icon: UserCheck, href: "/admin/users", color: "text-indigo-500 bg-indigo-500/10" },
  ];

  // Recent activity
  const { data: recentComments } = await supabaseAdmin
    .from("comments")
    .select("id, body, status, created_at, content_type")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentQA } = await supabaseAdmin
    .from("qa_entries")
    .select("id, question, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                  {stat.label.startsWith("Pending") && stat.count > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stat.count}</span>
                  )}
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.count}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="bg-card border border-border rounded-xl p-6 mb-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-foreground">Traffic Overview (Last 7 Days)</h2>
          <div className="text-sm text-muted">
            <span className="font-bold text-primary">{stats.totalViews}</span> views this month
          </div>
        </div>
        <AnalyticsChart data={stats.chartData} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Comments */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Comments</h2>
            <Link href="/admin/comments" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {recentComments && recentComments.length > 0 ? (
            <div className="space-y-3">
              {recentComments.map((comment: any) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  <MessageSquare size={16} className="text-muted mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{comment.body}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        comment.status === "approved" ? "bg-green-500/10 text-green-600" :
                        comment.status === "rejected" ? "bg-red-500/10 text-red-600" :
                        "bg-yellow-500/10 text-yellow-600"
                      }`}>{comment.status}</span>
                      <span className="text-xs text-muted">{comment.content_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No comments yet.</p>
          )}
        </div>

        {/* Recent Q&A */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Questions</h2>
            <Link href="/admin/qa" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {recentQA && recentQA.length > 0 ? (
            <div className="space-y-3">
              {recentQA.map((qa: any) => (
                <div key={qa.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  <HelpCircle size={16} className="text-muted mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{qa.question}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      qa.status === "answered" ? "bg-green-500/10 text-green-600" :
                      qa.status === "rejected" ? "bg-red-500/10 text-red-600" :
                      "bg-yellow-500/10 text-yellow-600"
                    }`}>{qa.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No questions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
