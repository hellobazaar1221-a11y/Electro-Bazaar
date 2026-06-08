"use client";

import { useEffect, useState } from "react";
import { Search, User, Mail, Phone, ShoppingBag, Pencil, Trash2, UserX, UserCheck, X } from "lucide-react";
import { formatRupees } from "@/lib/format";
import toast, { Toaster } from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  status: "ACTIVE" | "SUSPENDED";
  suspendReason?: string | null;
  _count?: { orders?: number };
  totalSpent?: number;
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(true);

  // Modals state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  const [suspendingCustomer, setSuspendingCustomer] = useState<Customer | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    const checkDark = () => {
      const dark =
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("admin-theme") !== "light";
      setIsDark(dark);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d?.customers ?? []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load customers");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = customers?.filter(
    (c) =>
      c?.name?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "") ||
      c?.email?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "")
  );

  // Edit Customer
  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setEditForm({
      name: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Customer profile updated successfully");
      setEditingCustomer(null);
      load();
    } catch (err) {
      toast.error("Failed to update customer profile");
    }
  };

  // Suspend Customer
  const openSuspendModal = (c: Customer) => {
    setSuspendingCustomer(c);
    setSuspendReason("");
  };

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingCustomer) return;
    if (!suspendReason.trim()) {
      toast.error("Please provide a suspension reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers/${suspendingCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUSPENDED",
          suspendReason: suspendReason.trim(),
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(`Account for ${suspendingCustomer.name} has been suspended`);
      setSuspendingCustomer(null);
      load();
    } catch (err) {
      toast.error("Failed to suspend account");
    }
  };

  // Unsuspend Customer
  const handleUnsuspend = async (c: Customer) => {
    if (!confirm(`Activate account for ${c.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/customers/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACTIVE",
          suspendReason: "",
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(`Account for ${c.name} activated successfully`);
      load();
    } catch (err) {
      toast.error("Failed to activate account");
    }
  };

  // Delete Customer
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      toast.success("Customer deleted successfully");
      load();
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const modalBgColor = isDark ? "#1e293b" : "#ffffff";

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>Customers</h1>
        <p style={{ fontSize: 14, color: textSecondary }}>Everyone who has signed up</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          style={{
            width: "100%",
            background: inputBg,
            border: `1px solid ${inputBorder}`,
            borderRadius: 8,
            padding: "10px 16px 10px 44px",
            color: textPrimary,
            outline: "none"
          }}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8" style={{ color: textSecondary }}>Loading...</div>
        ) : (
          filtered?.map((c) => (
            <div
              key={c?.id}
              style={{
                background: cardBg,
                borderRadius: 16,
                padding: 20,
                border: c?.status === "SUSPENDED" 
                  ? `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.4)'}` 
                  : `1px solid ${cardBorder}`,
                transition: "border 0.2s"
              }}
              onMouseEnter={(e) => {
                if (c?.status !== "SUSPENDED") {
                  e.currentTarget.style.border = `1px solid ${isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.6)'}`;
                }
              }}
              onMouseLeave={(e) => {
                if (c?.status !== "SUSPENDED") {
                  e.currentTarget.style.border = `1px solid ${cardBorder}`;
                } else {
                  e.currentTarget.style.border = `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.4)'}`;
                }
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                  {c?.name?.[0]?.toUpperCase?.() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontWeight: 700, color: textPrimary }} className="truncate">{c?.name}</div>
                  <div style={{ fontSize: 12, color: textSecondary }} className="truncate">{c?.email}</div>
                </div>
              </div>
              
              <div className="space-y-1 text-sm">
                {c?.phone && (
                  <div className="flex items-center gap-2" style={{ color: textSecondary }}>
                    <Phone className="w-3.5 h-3.5" /> {c?.phone}
                  </div>
                )}
                <div className="flex items-center gap-2" style={{ color: textSecondary }}>
                  <ShoppingBag className="w-3.5 h-3.5" /> {c?._count?.orders ?? 0} orders
                </div>
                <div style={{ fontSize: 12, color: textSecondary, marginTop: 8 }}>
                  Joined {new Date(c?.createdAt ?? "").toLocaleDateString("en-IN")}
                </div>
              </div>

              {c?.status === "SUSPENDED" && c?.suspendReason && (
                <div style={{ fontSize: 12, color: "#f59e0b", background: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)", padding: "8px 12px", borderRadius: 8, marginTop: 12, border: `1px dashed ${isDark ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.3)"}` }}>
                  <strong>Blocked Reason:</strong> {c.suspendReason}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 mt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
                {c?.status === "SUSPENDED" ? (
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    Blocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    Active
                  </span>
                )}
                
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    style={{ padding: 6, borderRadius: 8, color: "#22d3ee" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(6,182,212,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    title="Edit Customer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  
                  {c?.status === "SUSPENDED" ? (
                    <button
                      onClick={() => handleUnsuspend(c)}
                      style={{ padding: 6, borderRadius: 8, color: "#10b981" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      title="Activate Account"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => openSuspendModal(c)}
                      style={{ padding: 6, borderRadius: 8, color: "#f59e0b" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      title="Suspend/Block Account"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{ padding: 6, borderRadius: 8, color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && filtered?.length === 0 && (
          <div className="col-span-full text-center py-8" style={{ color: textSecondary }}>No customers found</div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div style={{ background: modalBgColor, borderRadius: 16, width: "100%", maxWidth: 500, border: `1px solid ${cardBorder}`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>
                  Edit Customer Profile
                </h2>
                <button onClick={() => setEditingCustomer(null)} style={{ padding: 8, borderRadius: 8, color: textSecondary }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Full Name</label>
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Email Address</label>
                  <input
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Phone Number</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${inputBorder}`, color: textPrimary, background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Suspend/Block Customer Modal */}
      {suspendingCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div style={{ background: modalBgColor, borderRadius: 16, width: "100%", maxWidth: 500, border: `1px solid ${cardBorder}`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>
                  Suspend Customer Account
                </h2>
                <button onClick={() => setSuspendingCustomer(null)} style={{ padding: 8, borderRadius: 8, color: textSecondary }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSuspendSubmit} className="p-5 space-y-4">
                <div style={{ fontSize: 13, color: textSecondary, lineHeight: "1.5" }}>
                  You are about to block/suspend access for <strong style={{ color: textPrimary }}>{suspendingCustomer.name}</strong> ({suspendingCustomer.email}). They will not be able to log in to their account.
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Reason for Block/Suspension *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter the reason why this account is being blocked (e.g. Unusual activity, violation of terms, spam order detection, etc.)"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "10px 12px", color: textPrimary, outline: "none", fontSize: 14 }}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
                  <button
                    type="button"
                    onClick={() => setSuspendingCustomer(null)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${inputBorder}`, color: textPrimary, background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-white shadow-md hover:shadow-red-600/30"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
