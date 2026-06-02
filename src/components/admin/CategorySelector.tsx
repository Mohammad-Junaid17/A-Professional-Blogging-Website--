"use client";
import { useState, useEffect } from "react";
import { Plus, Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface CategorySelectorProps {
  contentType: "articles" | "books" | "lectures" | "qa";
  category: string;
  setCategory: (val: string) => void;
  subCategory?: string;
  setSubCategory?: (val: string) => void;
}

export function CategorySelector({ contentType, category, setCategory, subCategory, setSubCategory }: CategorySelectorProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSub, setIsAddingSub] = useState(false);
  
  const [newCatName, setNewCatName] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const d = await res.json();
      if (d.data) {
        setCategories(d.data.filter((c: any) => !c.content_type || c.content_type === contentType));
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [contentType]);

  const parents = categories.filter(c => !c.parent_id);
  const currentParent = categories.find(c => c.name === category);
  const subCategories = currentParent ? categories.filter(c => c.parent_id === currentParent.id) : [];

  const handleCreate = async (name: string, isSub: boolean) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        content_type: contentType,
        parent_id: isSub && currentParent ? currentParent.id : null
      };

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }

      toast.success(`${isSub ? 'Sub-category' : 'Category'} created!`);
      
      // Refresh list
      await fetchCategories();
      
      // Auto-select the newly created one
      if (isSub && setSubCategory) {
        setSubCategory(name.trim());
        setIsAddingSub(false);
        setNewSubName("");
      } else {
        setCategory(name.trim());
        if (setSubCategory) setSubCategory(""); // clear sub when parent changes
        setIsAddingCategory(false);
        setNewCatName("");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
        {isAddingCategory ? (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="New Category Name"
              className="flex-1 p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(newCatName, false); } }}
            />
            <button type="button" onClick={() => handleCreate(newCatName, false)} disabled={loading || !newCatName.trim()} className="p-3 bg-primary text-card rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            </button>
            <button type="button" onClick={() => { setIsAddingCategory(false); setNewCatName(""); }} className="p-3 bg-muted/20 text-muted hover:text-foreground rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); if (setSubCategory) setSubCategory(""); }} 
              className="flex-1 p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {parents.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={() => setIsAddingCategory(true)}
              className="p-3 bg-muted/10 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center group"
              title="Add New Category"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Sub-category Selection (only if setSubCategory is provided) */}
      {setSubCategory !== undefined && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Sub-category</label>
          {isAddingSub ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                placeholder="New Sub-category Name"
                className="flex-1 p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(newSubName, true); } }}
              />
              <button type="button" onClick={() => handleCreate(newSubName, true)} disabled={loading || !newSubName.trim()} className="p-3 bg-primary text-card rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button type="button" onClick={() => { setIsAddingSub(false); setNewSubName(""); }} className="p-3 bg-muted/20 text-muted hover:text-foreground rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select 
                value={subCategory} 
                onChange={(e) => setSubCategory(e.target.value)} 
                className="flex-1 p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!category}
              >
                <option value="">Select Sub-category</option>
                {subCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => setIsAddingSub(true)}
                disabled={!category}
                className="p-3 bg-muted/10 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 group"
                title="Add New Sub-category"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
