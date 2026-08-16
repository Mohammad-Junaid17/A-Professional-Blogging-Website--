"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home, FileText, BookOpen, Users, Quote, HelpCircle, Menu, Search, Moon, Sun,
  ArrowRight, Video, ShieldAlert, MessageSquare, BookMarked, LogOut, User, Settings, ChevronDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const mainLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/qa", label: "Q&A", icon: HelpCircle },
  { href: "/scholars", label: "Scholars", icon: Users },
];

const moreLinks = [
  { href: "/lectures", label: "Lectures", icon: Video },
  { href: "/contentions", label: "Contentions", icon: ShieldAlert },
  { href: "/search", label: "Search", icon: Search },
];

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    async function getUser() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setLoading(false);
          return;
        }

        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) {
          // Log only if it's not the missing session error (though we already checked session)
          if (error.name !== 'AuthSessionMissingError') {
            console.error("Auth error:", error);
          }
        } else if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, email, full_name, role, avatar_url")
            .eq("id", authUser.id)
            .single();
          if (profile) setUser(profile);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        supabase
          .from("profiles")
          .select("id, email, full_name, role, avatar_url")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser(data);
          });
      }
    });

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string | null, email: string) => {
    if (name && name.trim()) {
      return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  // Hide navbar on admin pages (admin has its own layout)
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#31373D] border-b border-[#404850]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <span className="font-bold text-white text-xl hidden sm:block group-hover:opacity-90 transition-opacity">
            Islam360
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {mainLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors
                  ${isActive ? "bg-primary/20 text-[#9CC76D]" : "text-gray-300 hover:text-white hover:bg-white/10"}
                `}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu size={16} />
              More
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 border border-border">
                <div className="py-1" role="menu">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/10"
                      >
                        <Icon size={16} className="text-muted" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          <Link
            href="/search"
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </Link>

          {/* Auth Section */}
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-card flex items-center justify-center text-sm font-bold">
                      {getInitials(user.full_name, user.email)}
                    </div>
                    <ChevronDown size={14} className="text-gray-300 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-card ring-1 ring-black/5 border border-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{user.full_name || "User"}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/10">
                          <User size={16} className="text-muted" /> My Profile
                        </Link>
                        {user.role === "admin" && (
                          <>
                            <div className="border-t border-border my-1" />
                            <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-primary font-semibold hover:bg-muted/10">
                              <Settings size={16} /> Admin Panel
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 w-full text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Sign In <ArrowRight size={16} />
                </Link>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#404850] bg-[#31373D] px-4 py-4 space-y-2">
          {[...mainLinks, ...moreLinks].map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors
                  ${isActive ? "bg-primary/20 text-[#9CC76D]" : "text-gray-300 hover:text-white hover:bg-white/10"}
                `}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-[#404850]">
            {user ? (
              <button
                onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-base font-medium text-red-500 border border-red-500/20 transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-base font-medium text-card bg-primary transition-colors"
              >
                Sign In <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
