"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2 } from "lucide-react";

const SETTINGS_KEYS = [
  { key: "site_name", label: "Site Name", type: "text" },
  { key: "site_tagline", label: "Site Tagline", type: "text" },
  { key: "hero_quote", label: "Hero Quran Quote (Arabic)", type: "text", dir: "rtl" },
  { key: "contact_email", label: "Contact Email", type: "email" },
  { key: "social_twitter", label: "Twitter URL", type: "url" },
  { key: "social_github", label: "GitHub URL", type: "url" },
  { key: "maintenance_mode", label: "Maintenance Mode", type: "toggle" },
];

export default function AdminSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((row: any) => { map[row.key] = row.value || ""; });
      setSettings(map);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("site_settings").upsert({ key, value });
    }
    setSaving(false);
    setMessage("Settings saved successfully!");
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">Settings</h1>

      {message && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-3 rounded-lg text-sm mb-6">{message}</div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {SETTINGS_KEYS.map((setting) => (
          <div key={setting.key}>
            <label className="block text-sm font-semibold text-foreground mb-1.5">{setting.label}</label>
            {setting.type === "toggle" ? (
              <button
                onClick={() => setSettings(p => ({ ...p, [setting.key]: p[setting.key] === "true" ? "false" : "true" }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings[setting.key] === "true" ? "bg-primary" : "bg-muted/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings[setting.key] === "true" ? "translate-x-6" : ""}`} />
              </button>
            ) : (
              <input
                type={setting.type || "text"}
                value={settings[setting.key] || ""}
                onChange={(e) => setSettings(p => ({ ...p, [setting.key]: e.target.value }))}
                dir={(setting as any).dir || "ltr"}
                className={`w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${(setting as any).dir === "rtl" ? "font-amiri text-xl" : ""}`}
              />
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-border flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-primary text-card px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
