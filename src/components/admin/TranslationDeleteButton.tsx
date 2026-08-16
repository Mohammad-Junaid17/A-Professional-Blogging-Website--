"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TranslationDeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this translation?")) return;
    
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("translations").delete().eq("id", id);
    
    if (error) {
      alert("Error deleting translation: " + error.message);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      title="Delete Translation"
      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
