"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Search, Settings } from "lucide-react";

const AVAILABLE_SECTIONS = [
  { id: 'articles', label: 'Articles' },
  { id: 'books', label: 'Books' },
  { id: 'scholars', label: 'Scholars' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'qa', label: 'Q&A' },
  { id: 'proofs', label: 'Proofs' },
  { id: 'contentions', label: 'Contentions' },
  { id: 'lectures', label: 'Lectures' },
  { id: 'comments', label: 'Comments' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'categories', label: 'Categories' },
];

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editRole, setEditRole] = useState("user");
  const [editSections, setEditSections] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role || 'user');
    setEditSections(user.access_sections || []);
    setModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setActing(selectedUser.id);
    setModalOpen(false);
    try {
      const action = editRole === 'admin' ? 'make_admin' : editRole === 'moderator' ? 'make_moderator' : 'make_user';
      const body: any = { action };
      if (editRole === 'moderator') {
        body.access_sections = editSections;
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to change role");
      
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: editRole, access_sections: editRole === 'moderator' ? editSections : [] } : u));
    } catch (err: any) {
      console.error(err);
    }
    setActing(null);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Users</h1>
          <p className="text-muted text-sm mt-1">{users.length} registered users</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/5">
                    <td className="px-4 py-3 text-foreground font-medium">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit text-xs px-2 py-1 rounded-full font-semibold ${
                          u.role === "admin" ? "bg-primary/10 text-primary" : 
                          u.role === "moderator" ? "bg-amber-500/10 text-amber-600" : 
                          "bg-muted/10 text-muted"
                        }`}>{u.role}</span>
                        {u.role === 'moderator' && u.access_sections?.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {u.access_sections.length} section(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {acting === u.id ? (
                          <Loader2 size={16} className="animate-spin text-muted" />
                        ) : (
                          <button
                            onClick={() => openModal(u)}
                            className="flex items-center gap-2 bg-background border border-border hover:bg-muted/10 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                          >
                            <Settings size={14} /> Manage
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">{searchTerm ? "No users match your search." : "No users found."}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Manage User Role</h3>
              <p className="text-sm text-muted">{selectedUser.email}</p>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              {editRole === 'moderator' && (
                <div className="pt-2 border-t border-border">
                  <label className="block text-sm font-semibold mb-3">Moderator Access Sections</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                    {AVAILABLE_SECTIONS.map((section) => (
                      <label key={section.id} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 hover:bg-muted/10 rounded">
                        <input
                          type="checkbox"
                          checked={editSections.includes(section.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSections([...editSections, section.id]);
                            } else {
                              setEditSections(editSections.filter(s => s !== section.id));
                            }
                          }}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        {section.label}
                      </label>
                    ))}
                  </div>
                  {editSections.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">Please select at least one section.</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-background flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={editRole === 'moderator' && editSections.length === 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
