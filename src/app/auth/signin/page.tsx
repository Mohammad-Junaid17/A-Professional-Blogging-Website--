"use client";
import React from "react";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo !== '/' ? `?next=${redirectTo}` : ''}`,
      },
    });
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      alert("Password reset email sent! Check your inbox.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-card border border-border p-8 sm:p-10 rounded-2xl w-full max-w-md shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex flex-col items-center gap-3">
            <div className="h-20 flex items-center justify-center">
              <img src="/MuftieAzam.png" alt="Logo" className="h-full w-auto object-contain dark:brightness-0 dark:invert opacity-90 dark:opacity-100" />
            </div>
            <span className="font-amiri italic text-2xl tracking-widest text-slate-700 dark:text-slate-300">Servant of Noori</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold font-serif text-center mb-1 text-foreground">Welcome Back</h1>
        <p className="text-muted text-center text-sm mb-8">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted/50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-card py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center my-6 gap-4">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-xs text-muted font-medium uppercase tracking-wider">Or continue with</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-card border border-border hover:bg-muted/10 text-foreground py-3 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <GoogleIcon />
          Google
        </button>

        <p className="text-center text-sm text-muted mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>}>
      <SignInForm />
    </Suspense>
  );
}
