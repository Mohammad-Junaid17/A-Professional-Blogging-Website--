"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronRight, TrendingUp } from "lucide-react";

export interface CategoryCount {
  name: string;
  count: number;
}

export interface CategoryFilterBarProps {
  categories: string[];
  categoryCounts?: CategoryCount[];   // optional per-category counts
  allCategoryLabel: string;
  paramName?: string;
  searchPlaceholder?: string;
  resultCount: number;
  visibleCount?: number;
  basePath: string;
  section: string;                    // e.g. "articles" — used for localStorage key
  autocompleteItems?: string[];       // optional list of titles for autocomplete
  extraGroup?: {
    label: string;
    paramName: string;
    items: string[];
  };
}

const RECENT_KEY_PREFIX = "cfb_recent_";
const MAX_RECENT = 5;

function getRecentCategories(section: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`${RECENT_KEY_PREFIX}${section}`) || "[]");
  } catch {
    return [];
  }
}

function saveRecentCategory(section: string, cat: string) {
  if (typeof window === "undefined" || !cat) return;
  try {
    const existing = getRecentCategories(section).filter((c) => c !== cat);
    localStorage.setItem(`${RECENT_KEY_PREFIX}${section}`, JSON.stringify([cat, ...existing].slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

export function CategoryFilterBar({
  categories: rawCategories,
  categoryCounts,
  allCategoryLabel,
  paramName = "category",
  searchPlaceholder = "Search...",
  resultCount,
  visibleCount = 8,
  basePath,
  section,
  autocompleteItems = [],
  extraGroup,
}: CategoryFilterBarProps) {
  const categories = Array.from(new Set(rawCategories));
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get(paramName) || "";
  const activeExtra = extraGroup ? searchParams.get(extraGroup.paramName) || "" : "";
  const currentQ = searchParams.get("q") || "";

  const [searchValue, setSearchValue] = useState(currentQ);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pillRowRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstModalItemRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Load recent categories from localStorage on mount
  useEffect(() => {
    setRecentCategories(getRecentCategories(section));
  }, [section]);

  // Sync search input with URL on back/forward navigation
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  // Scroll fade masks
  const updateFades = useCallback(() => {
    const el = pillRowRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 8);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = pillRowRef.current;
    if (!el) return;
    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    window.addEventListener("resize", updateFades);
    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, [updateFades, categories]);

  // Focus first modal item when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => firstModalItemRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setModalOpen(false); setModalSearch(""); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Close autocomplete on outside click
  useEffect(() => {
    if (!autocompleteOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!autocompleteRef.current?.contains(e.target as Node) && !searchInputRef.current?.contains(e.target as Node)) {
        setAutocompleteOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [autocompleteOpen]);

  // Build URL helper
  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const base: Record<string, string> = {
        [paramName]: activeCategory,
        q: currentQ,
        ...(extraGroup ? { [extraGroup.paramName]: activeExtra } : {}),
      };
      const merged = { ...base, ...overrides };
      const params = new URLSearchParams();
      Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
      const qs = params.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [activeCategory, activeExtra, basePath, currentQ, extraGroup, paramName]
  );

  const handleCategoryClick = (cat: string) => {
    if (cat) saveRecentCategory(section, cat);
    setRecentCategories(getRecentCategories(section));
    router.push(buildUrl({ [paramName]: cat, ...(extraGroup ? { [extraGroup.paramName]: "" } : {}) }));
    setModalOpen(false);
    setModalSearch("");
  };

  const handleExtraClick = (value: string) => {
    router.push(buildUrl({ [extraGroup!.paramName]: value === activeExtra ? "" : value, [paramName]: "" }));
    setModalOpen(false);
    setModalSearch("");
  };

  const handleClearAll = () => {
    router.push(basePath);
    setSearchValue("");
    setAutocompleteOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    setAutocompleteOpen(val.length > 1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { router.push(buildUrl({ q: val })); }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setAutocompleteOpen(false);
    router.push(buildUrl({ q: searchValue }));
  };

  const handleAutocompleteSelect = (item: string) => {
    setSearchValue(item);
    setAutocompleteOpen(false);
    router.push(buildUrl({ q: item }));
  };

  const getCount = (cat: string) => categoryCounts?.find((c) => c.name === cat)?.count;

  // Autocomplete suggestions: match titles + match category names
  const acItems = autocompleteItems
    .filter((t) => t.toLowerCase().includes(searchValue.toLowerCase()))
    .slice(0, 6);
  const acCategories = categories
    .filter((c) => c.toLowerCase().includes(searchValue.toLowerCase()))
    .slice(0, 3);

  const inlinePills = categories.slice(0, visibleCount);
  const hasModal = categories.length > 0 || !!(extraGroup && extraGroup.items.length > 0);

  // Active filter chips (always visible)
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (activeCategory) {
    activeChips.push({ label: activeCategory, onRemove: () => handleCategoryClick("") });
  }
  if (activeExtra) {
    activeChips.push({ label: activeExtra, onRemove: () => router.push(buildUrl({ [extraGroup!.paramName]: "" })) });
  }
  if (currentQ) {
    activeChips.push({ label: `"${currentQ}"`, onRemove: () => { setSearchValue(""); router.push(buildUrl({ q: "" })); } });
  }

  // Pills to surface first: recent (intersect with category list) then inline
  const recentInList = recentCategories.filter((r) => categories.includes(r) && r !== activeCategory);
  const pillsToShow = inlinePills;

  // Filtered modal categories
  const filteredModalCategories = modalSearch
    ? categories.filter((c) => c.toLowerCase().includes(modalSearch.toLowerCase()))
    : categories;

  return (
    <div className="mb-8 space-y-3">

      {/* ── Search bar with autocomplete ── */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => { if (searchValue.length > 1) setAutocompleteOpen(true); }}
            placeholder={searchPlaceholder}
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={autocompleteOpen}
            autoComplete="off"
            className="w-full pl-11 pr-14 py-3 bg-card border border-border rounded-full text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => { setSearchValue(""); setAutocompleteOpen(false); router.push(buildUrl({ q: "" })); }}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-card rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Submit search"
          >
            <ChevronRight size={16} />
          </button>
        </form>

        {/* Autocomplete dropdown */}
        {autocompleteOpen && (acItems.length > 0 || acCategories.length > 0) && (
          <div
            ref={autocompleteRef}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-40 overflow-hidden"
            role="listbox"
          >
            {acCategories.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-muted uppercase tracking-widest">Categories</p>
                {acCategories.map((cat) => (
                  <button
                    key={cat}
                    role="option"
                    onClick={() => { handleCategoryClick(cat); setSearchValue(""); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-muted hover:bg-muted/10 hover:text-foreground transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">{cat}</span>
                    {getCount(cat) !== undefined && (
                      <span className="text-xs text-muted/70">{getCount(cat)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {acItems.length > 0 && (
              <div className={acCategories.length > 0 ? "border-t border-border/50" : ""}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-muted uppercase tracking-widest">Results</p>
                {acItems.map((item) => (
                  <button
                    key={item}
                    role="option"
                    onClick={() => handleAutocompleteSelect(item)}
                    className="w-full text-left px-4 py-2.5 text-sm text-muted hover:bg-muted/10 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Search size={13} className="shrink-0 opacity-50" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-border/50 px-4 py-2">
              <button
                onClick={handleSearchSubmit as any}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Search for &ldquo;{searchValue}&rdquo; &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Pills section ── */}
      {categories.length > 0 && (
        <div className="space-y-2">

          {/* Recent categories row (if any and not already in inline pills) */}
          {recentInList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">
                <TrendingUp size={11} /> Recent
              </span>
              {recentInList.slice(0, 3).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    activeCategory === cat
                      ? "bg-primary text-card border-primary"
                      : "bg-primary/5 text-primary/80 border-primary/20 hover:border-primary/60 hover:bg-primary/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Row 1: Scrollable pills ONLY */}
          <div className="relative">
            {showLeftFade && (
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            )}
            {showRightFade && (
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            )}
            <div
              ref={pillRowRef}
              className="flex items-center gap-2 overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              role="listbox"
              aria-label="Category filters"
            >
              {/* All pill */}
              <button
                onClick={() => handleCategoryClick("")}
                role="option"
                aria-selected={!activeCategory && !activeExtra}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  !activeCategory && !activeExtra
                    ? "bg-primary text-card border-primary shadow-sm"
                    : "bg-card text-muted border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {allCategoryLabel}
              </button>

              {pillsToShow.map((cat) => {
                const count = getCount(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    role="option"
                    aria-selected={activeCategory === cat && !activeExtra}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      activeCategory === cat && !activeExtra
                        ? "bg-primary text-card border-primary shadow-sm"
                        : "bg-card text-muted border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                    {count !== undefined && (
                      <span className={`ml-1.5 text-[11px] font-normal ${activeCategory === cat && !activeExtra ? "opacity-80" : "opacity-60"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Filters button (left) + result count (right) — NEVER inside scroll */}
          <div className="flex items-center justify-between">
            {hasModal ? (
              <button
                onClick={() => setModalOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={modalOpen}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border border-border bg-card text-muted hover:border-primary/50 hover:text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <SlidersHorizontal size={14} />
                Filters
                {categories.length > visibleCount && (
                  <span className="ml-1 text-[11px] bg-muted/15 text-muted px-1.5 py-0.5 rounded-full leading-none">
                    +{categories.length - visibleCount}
                  </span>
                )}
              </button>
            ) : <div />}
            <span className="text-sm text-muted font-medium">
              {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Result count — search-only mode (no categories) */}
      {categories.length === 0 && (
        <div className="flex justify-end">
          <span className="text-sm text-muted font-medium">
            {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Active filter chips ── */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium shrink-0">Active:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              onClick={chip.onRemove}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {chip.label} <X size={11} />
            </button>
          ))}
          <button
            onClick={handleClearAll}
            className="text-xs text-muted hover:text-foreground underline underline-offset-2 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Extra group pills (e.g. YouTube Channels) ── */}
      {extraGroup && extraGroup.items.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted uppercase tracking-wider shrink-0">{extraGroup.label}:</span>
          {extraGroup.items.map((item) => (
            <button
              key={item}
              onClick={() => handleExtraClick(item)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                activeExtra === item
                  ? "bg-primary text-card border-primary"
                  : "bg-card text-muted border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* ── Filters modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => { setModalOpen(false); setModalSearch(""); }}
          role="dialog"
          aria-modal="true"
          aria-label="All Categories"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            ref={modalRef}
            className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[72vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 className="font-bold text-foreground text-lg font-serif">All Categories</h3>
              <div className="flex items-center gap-3">
                <button onClick={handleClearAll} className="text-sm text-muted hover:text-primary transition-colors font-medium">
                  Clear all
                </button>
                <button
                  onClick={() => { setModalOpen(false); setModalSearch(""); }}
                  className="p-1.5 rounded-lg hover:bg-muted/10 text-muted hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Search within list */}
            <div className="px-4 pt-3 pb-2 shrink-0 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={15} />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoComplete="off"
                />
                {modalSearch && (
                  <button onClick={() => setModalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label="Clear">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable category list */}
            <div className="overflow-y-auto flex-1 p-3 space-y-0.5">
              {/* "All" — pinned, not filtered by search */}
              <button
                ref={firstModalItemRef}
                onClick={() => handleCategoryClick("")}
                aria-selected={!activeCategory}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  !activeCategory
                    ? "bg-primary text-card font-semibold"
                    : "text-muted hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                {allCategoryLabel}
              </button>

              {filteredModalCategories.length > 0 ? (
                filteredModalCategories.map((cat) => {
                  const count = getCount(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      aria-selected={activeCategory === cat}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between ${
                        activeCategory === cat
                          ? "bg-primary text-card font-semibold"
                          : "text-muted hover:bg-muted/10 hover:text-foreground"
                      }`}
                    >
                      <span>{cat}</span>
                      {count !== undefined && (
                        <span className={`text-xs ml-2 shrink-0 ${activeCategory === cat ? "opacity-80" : "opacity-50"}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-6 text-sm text-muted text-center">
                  No categories match &ldquo;{modalSearch}&rdquo;
                </p>
              )}

              {extraGroup && extraGroup.items.length > 0 && (
                <>
                  <div className="pt-3 pb-1 px-4">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest">{extraGroup.label}</p>
                  </div>
                  {extraGroup.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleExtraClick(item)}
                      aria-selected={activeExtra === item}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        activeExtra === item
                          ? "bg-primary text-card font-semibold"
                          : "text-muted hover:bg-muted/10 hover:text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 px-5 py-4 border-t border-border flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => { setModalOpen(false); setModalSearch(""); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-card text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
