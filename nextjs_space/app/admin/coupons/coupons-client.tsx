"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, Plus, Trash2, Loader2, Copy, Calendar, Percent, IndianRupee,
  CheckCircle2, XCircle, ToggleLeft, ToggleRight, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";

const EMPTY_FORM = {
  code: "", type: "PERCENT", value: "", minOrder: "", maxUses: "", expiresAt: "", description: "", isActive: true,
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(dateStr: string) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isDark, setIsDark] = useState(true);

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

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value || !form.expiresAt) { toast.error("Please fill all required fields"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, value: Number(form.value), minOrder: Number(form.minOrder || 0), maxUses: form.maxUses ? Number(form.maxUses) : null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create coupon"); return; }
      toast.success("Coupon created successfully!");
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    toast.success("Coupon deleted");
    load();
  };

  const toggleActive = async (coupon: any) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3" style={{ color: textPrimary }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            Coupons
          </h1>
          <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Create and manage discount coupons for customers</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 24 }}
          >
            <h2 className="text-lg font-display font-bold mb-5 flex items-center gap-2" style={{ color: textPrimary }}>
              <Tag className="w-5 h-5 text-violet-500" /> Create New Coupon
            </h2>
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Code */}
              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>Coupon Code *</label>
                <input
                  required value={form.code}
                  onChange={e => update("code", e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none", fontFamily: "monospace", letterSpacing: 2 }}
                />
              </div>
              {/* Type */}
              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>Discount Type *</label>
                <select value={form.type} onChange={e => update("type", e.target.value)} style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
              {/* Value */}
              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>
                  {form.type === "PERCENT" ? "Discount %" : "Discount ₹"} *
                </label>
                <input
                  required type="number" min="1" max={form.type === "PERCENT" ? "100" : undefined}
                  value={form.value} onChange={e => update("value", e.target.value)}
                  placeholder={form.type === "PERCENT" ? "e.g. 20" : "e.g. 500"}
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}
                />
              </div>
              {/* Min Order */}
              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>Min Order Value (₹)</label>
                <input
                  type="number" min="0" value={form.minOrder} onChange={e => update("minOrder", e.target.value)}
                  placeholder="0 = no minimum"
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}
                />
              </div>
              {/* Max Uses */}
              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>Max Uses (optional)</label>
                <input
                  type="number" min="1" value={form.maxUses} onChange={e => update("maxUses", e.target.value)}
                  placeholder="Leave blank = unlimited"
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}
                />
              </div>
              {/* Expiry Date */}
              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>Expiry Date *</label>
                <input
                  required type="datetime-local" value={form.expiresAt} onChange={e => update("expiresAt", e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}
                />
              </div>
              {/* Description */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>Description (shown to customers)</label>
                <input
                  value={form.description} onChange={e => update("description", e.target.value)}
                  placeholder="e.g. Get 20% off on your first order!"
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}
                />
              </div>
              {/* Active */}
              <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => update("isActive", !form.isActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.isActive ? "bg-violet-500" : "bg-slate-500"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-7" : "translate-x-1"}`} />
                  </div>
                  <span style={{ fontSize: 14, color: textSecondary }}>{form.isActive ? "Active" : "Inactive"}</span>
                </label>
              </div>
              {/* Buttons */}
              <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Coupon
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }} style={{ color: textSecondary }}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, color: "from-violet-500 to-purple-600" },
          { label: "Active", value: coupons.filter(c => c.isActive && new Date(c.expiresAt) > new Date()).length, color: "from-emerald-500 to-teal-600" },
          { label: "Expired", value: coupons.filter(c => new Date(c.expiresAt) <= new Date()).length, color: "from-rose-500 to-red-600" },
          { label: "Total Used", value: coupons.reduce((s, c) => s + (c.usedCount ?? 0), 0), color: "from-sky-500 to-blue-600" },
        ].map(stat => (
          <div key={stat.label} style={{ background: cardBg, borderRadius: 12, padding: 16, border: `1px solid ${cardBorder}` }}>
            <div className={`text-2xl font-display font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            <div style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="w-16 h-16 mx-auto mb-4" style={{ color: textSecondary }} />
          <p style={{ fontSize: 18, fontWeight: 500, color: textSecondary }}>No coupons yet</p>
          <p style={{ fontSize: 14, color: textSecondary, marginTop: 4 }}>Create your first coupon to offer discounts to customers</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map(coupon => {
            const expired = new Date(coupon.expiresAt) <= new Date();
            const days = daysLeft(coupon.expiresAt);
            const usagePercent = coupon.maxUses ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100)) : null;

            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: cardBg,
                  border: expired ? `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.4)'}` : coupon.isActive ? `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.5)'}` : `1px solid ${cardBorder}`,
                  borderRadius: 16,
                  padding: 20,
                  opacity: expired ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Code + discount */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${coupon.type === "PERCENT" ? "bg-violet-500/10" : "bg-emerald-500/10"}`}>
                      {coupon.type === "PERCENT" ? <Percent className="w-6 h-6 text-violet-500" /> : <IndianRupee className="w-6 h-6 text-emerald-500" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 18, color: textPrimary, letterSpacing: 1 }}>{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} style={{ color: textSecondary }} className="hover:text-violet-500 transition">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {!expired && coupon.isActive && (
                          <span style={{ fontSize: 10, background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Active</span>
                        )}
                        {!coupon.isActive && !expired && (
                          <span style={{ fontSize: 10, background: "rgba(100,116,139,0.1)", color: "#64748b", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Disabled</span>
                        )}
                        {expired && (
                          <span style={{ fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Expired</span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: textSecondary, marginTop: 2 }}>
                        <span style={{ fontWeight: 700, color: textPrimary }}>
                          {coupon.type === "PERCENT" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </span>
                        {coupon.minOrder > 0 && <span> · Min order ₹{coupon.minOrder}</span>}
                      </p>
                      {coupon.description && <p style={{ fontSize: 12, color: textSecondary, marginTop: 2 }} className="truncate">{coupon.description}</p>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm shrink-0">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                        <span style={{ fontWeight: 500, color: expired ? "#ef4444" : days <= 3 ? "#f59e0b" : textSecondary }}>
                          {expired ? "Expired" : `${days}d left`}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>{formatDate(coupon.expiresAt)}</p>
                    </div>
                    <div className="text-center">
                      <p style={{ fontWeight: 700, color: textPrimary }}>{coupon.usedCount ?? 0}</p>
                      <p style={{ fontSize: 12, color: textSecondary }}>{coupon.maxUses ? `/ ${coupon.maxUses} uses` : "uses"}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(coupon)}
                      title={coupon.isActive ? "Deactivate" : "Activate"}
                      style={{ padding: 8, borderRadius: 8, color: textSecondary, background: "transparent" }}
                      className="hover:text-violet-500"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {coupon.isActive ? <ToggleRight className="w-5 h-5 text-violet-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id, coupon.code)}
                      style={{ padding: 8, borderRadius: 8, color: textSecondary, background: "transparent" }}
                      className="hover:text-red-500"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Usage bar */}
                {usagePercent !== null && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${cardBorder}` }}>
                    <div className="flex justify-between" style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>
                      <span>Usage</span>
                      <span>{coupon.usedCount} / {coupon.maxUses}</span>
                    </div>
                    <div style={{ height: 6, background: inputBorder, borderRadius: 999, overflow: "hidden" }}>
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
