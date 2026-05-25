"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, label = "Cover Image", placeholder = "Upload an image or paste URL..." }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await res.json();
      onChange(url);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input 
          type="url" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex-1" 
        />
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleUpload} 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={uploading}
          className="px-4 py-3 bg-muted/10 border border-border rounded-lg text-foreground hover:bg-muted/20 transition-colors flex items-center justify-center min-w-[56px] disabled:opacity-50 shrink-0"
          title="Upload Image"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        </button>
      </div>
      
      {value && (
        <div className="mt-3 relative inline-block">
          <div className="w-24 h-32 bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center group relative">
            <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <button 
              type="button" 
              onClick={() => onChange("")} 
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
