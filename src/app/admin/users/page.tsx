"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRole = async (id: string, newRole: string) => {
    setActing(id);
    try {
      const action = newRole === 'admin' ? 'make_admin' : newRole === 'moderator' ? 'make_moderator' : 'make_user';
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to change role");
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      console.error(err);
    }
    setActing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Users</h1>
          <p className="text-muted text-sm mt-1">{users.length} registered users</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border"><tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/5">
                    <td className="px-4 py-3 text-foreground font-medium">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        u.role === "admin" ? "bg-primary/10 text-primary" : 
                        u.role === "moderator" ? "bg-amber-500/10 text-amber-600" : 
                        "bg-muted/10 text-muted"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {acting === u.id ? (
                          <Loader2 size={16} className="animate-spin text-muted" />
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => setRole(u.id, e.target.value)}
                            className="bg-background border border-border rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
