"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import toast from "react-hot-toast";

interface SaveButtonProps {
  contentType: 'article' | 'book' | 'lecture' | 'qa' | 'scholar';
  contentId: string;
  iconOnly?: boolean;
}

export default function SaveButton({ contentType, contentId, iconOnly = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSaved() {
      try {
        const res = await fetch(`/api/profile/saved?type=${contentType}&id=${contentId}`);
        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.isSaved);
        }
      } catch (err) {
        console.error("Failed to check saved status", err);
      } finally {
        setLoading(false);
      }
    }
    checkSaved();
  }, [contentType, contentId]);

  const handleSaveToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isSaved) {
        const res = await fetch('/api/profile/saved', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_type: contentType, content_id: contentId }),
        });
        
        if (res.ok) {
          setIsSaved(false);
          toast.success("Removed from saved items");
        } else if (res.status === 401) {
          toast.error("Please sign in to save items");
        } else {
          toast.error("Failed to remove item");
        }
      } else {
        const res = await fetch('/api/profile/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_type: contentType, content_id: contentId }),
        });
        
        if (res.ok) {
          setIsSaved(true);
          toast.success("Saved to your profile!");
        } else if (res.status === 401) {
          toast.error("Please sign in to save items");
        } else {
          toast.error("Failed to save item");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-colors flex items-center justify-center gap-2 group ${
        iconOnly ? '' : 'border'
      } ${
        isSaved 
          ? (iconOnly ? 'text-primary' : 'bg-primary/10 text-primary border-primary/20')
          : (iconOnly ? 'text-muted hover:text-foreground' : 'bg-background hover:bg-muted/10 text-muted border-border')
      }`}
      title={isSaved ? "Remove from Saved" : "Save"}
    >
      <Bookmark 
        size={iconOnly ? 18 : 20} 
        className={`transition-transform group-hover:scale-110 ${isSaved ? 'fill-primary text-primary' : ''}`} 
      />
      {!iconOnly && (
        <span className="text-sm font-medium hidden sm:inline-block">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
