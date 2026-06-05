"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, BookOpen, Users, Quote, HelpCircle,
  BookMarked, ShieldAlert, Video, MessageSquare, Mail, Settings,
  LogOut, ChevronLeft, Menu, BookOpenCheck, Tags, Moon, Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/books", label: "Books", icon: BookOpen },
  { href: "/admin/scholars", label: "Scholars", icon: Users },
  { href: "/admin/qa", label: "Q&A", icon: HelpCircle },
  { href: "/admin/contentions", label: "Contentions", icon: ShieldAlert },
  { href: "/admin/lectures", label: "Lectures", icon: Video },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ role = "admin", accessSections = [] }: { role?: string, accessSections?: string[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#31373D] text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Overlay on mobile */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-[#31373D] text-white flex flex-col transition-all duration-300
          ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"}
        `}
      >
        {/* Header */}
        <div className={`flex ${collapsed ? 'flex-col items-center justify-center gap-4 py-4 px-2' : 'items-center justify-between px-4 py-5'} border-b border-white/10`}>
          <Link href="/admin" className="flex items-center gap-2">
            {!collapsed && <span className="font-bold text-lg">Admin</span>}
          </Link>
          <div className={`flex ${collapsed ? 'flex-col' : 'items-center'} gap-2`}>
            <Link
              href="/"
              className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Back to Site"
            >
              <LogOut size={18} />
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Sidebar"
            >
              <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarLinks.filter(link => {
            if (role === "admin") return true;
            if (link.href === "/admin") return true; // Always show Dashboard to moderators
            
            // For moderators, hide sensitive sections entirely
            if (link.href === "/admin/users" || link.href === "/admin/settings") return false;
            
            // Check if link matches an allowed access section
            const sectionId = link.href.split("/")[2]; // e.g. "/admin/articles" -> "articles"
            if (sectionId && accessSections.length > 0) {
              return accessSections.includes(sectionId);
            }
            
            return false;
          }).map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => { if (window.innerWidth < 1024) setCollapsed(true); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
