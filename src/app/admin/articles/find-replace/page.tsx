"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { Search, Replace, AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

interface MatchResult {
  id: string;
  title: string;
  occurrences: number;
  fields: string[];
}

type Step = "input" | "preview" | "done";

export default function FindReplacePage() {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [fields, setFields] = useState<string[]>(["content", "excerpt", "title"]);
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [totalOccurrences, setTotalOccurrences] = useState(0);
  const [resultMessage, setResultMessage] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleField = (f: string) =>
    setFields((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handlePreview = async () => {
    if (!find.trim()) { toast.error("Enter text to find"); return; }
    if (fields.length === 0) { toast.error("Select at least one field"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles/find-replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ find, replace, caseSensitive, fields, preview: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setMatches(data.matches);
      setTotalOccurrences(data.total);
      setStep("preview");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles/find-replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ find, replace, caseSensitive, fields, preview: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Replace failed");
      setResultMessage(data.message);
      setStep("done");
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFind(""); setReplace(""); setMatches([]);
    setTotalOccurrences(0); setResultMessage("");
    setStep("input"); setExpandedIds(new Set());
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-1">Find &amp; Replace</h1>
        <p className="text-muted text-sm">Search for a word or phrase across all article content and replace it in one go.</p>
      </div>

      {/* ── Input Step ── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">

        {/* Find */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            <Search size={14} className="inline mr-1.5 text-muted" />Find
          </label>
          <input
            id="find-input"
            type="text"
            value={find}
            onChange={(e) => { setFind(e.target.value); if (step !== "input") setStep("input"); }}
            placeholder="Text to search for…"
            className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Replace */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            <Replace size={14} className="inline mr-1.5 text-muted" />Replace with
          </label>
          <input
            id="replace-input"
            type="text"
            value={replace}
            onChange={(e) => { setReplace(e.target.value); if (step !== "input") setStep("input"); }}
            placeholder="Replacement text (leave empty to delete)"
            className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4 items-center pt-1">
          {/* Case sensitive */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-foreground">
            <div
              onClick={() => setCaseSensitive((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${caseSensitive ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${caseSensitive ? "translate-x-4" : ""}`} />
            </div>
            Case-sensitive
          </label>

          {/* Field checkboxes */}
          <div className="flex gap-3 ml-auto">
            {(["content", "excerpt", "title"] as const).map((f) => (
              <label key={f} className="flex items-center gap-1.5 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="checkbox"
                  checked={fields.includes(f)}
                  onChange={() => toggleField(f)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span className="capitalize">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search button */}
        <div className="pt-1">
          <button
            id="preview-btn"
            onClick={handlePreview}
            disabled={loading || !find.trim()}
            className="flex items-center gap-2 bg-primary text-card px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading && step === "input" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </div>
      </div>

      {/* ── Preview Step ── */}
      {step === "preview" && (
        <div className="mt-6 space-y-4">
          {matches.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No matches found for <span className="text-foreground font-bold">&ldquo;{find}&rdquo;</span></p>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={18} />
                  <span className="font-semibold text-sm">
                    Found <strong>{totalOccurrences}</strong> occurrence{totalOccurrences !== 1 ? "s" : ""} across <strong>{matches.length}</strong> article{matches.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("input")}
                    className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted hover:text-foreground hover:bg-muted/10 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    id="apply-btn"
                    onClick={handleApply}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-card px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />}
                    Replace All
                  </button>
                </div>
              </div>

              {/* Match list */}
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {matches.map((m) => (
                  <div key={m.id}>
                    <button
                      onClick={() => toggleExpand(m.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                          {m.occurrences}×
                        </span>
                        <span className="text-foreground font-medium text-sm truncate">{m.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-xs text-muted hidden sm:block">
                          in {m.fields.join(", ")}
                        </span>
                        {expandedIds.has(m.id) ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                      </div>
                    </button>
                    {expandedIds.has(m.id) && (
                      <div className="px-4 pb-3 text-xs text-muted bg-background/50">
                        <span className="font-semibold text-foreground">&ldquo;{find}&rdquo;</span> will be replaced with{" "}
                        <span className="font-semibold text-primary">&ldquo;{replace || "(deleted)"}&rdquo;</span>{" "}
                        in fields: <span className="font-medium text-foreground">{m.fields.join(", ")}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Done Step ── */}
      {step === "done" && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={24} className="shrink-0" />
            <div>
              <p className="font-bold">{resultMessage}</p>
              <p className="text-sm opacity-80 mt-0.5">All changes have been saved to the database.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted/10 transition-colors shrink-0"
          >
            <RotateCcw size={14} /> New Search
          </button>
        </div>
      )}
    </div>
  );
}
