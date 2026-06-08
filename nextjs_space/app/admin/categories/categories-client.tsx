"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  _count?: { products?: number };
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", description: "" });
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
      const r = await fetch("/api/admin/categories");
      const d = await r.json();
      setCategories(d?.categories ?? []);
    } catch (e) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = (c: Category | null) => {
    setEditing(c);
    setForm({
      name: c?.name ?? "",
      slug: c?.slug ?? "",
      icon: c?.icon ?? "",
      description: c?.description ?? "",
    });
    setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form?.name,
      slug: form?.slug || form?.name?.toLowerCase?.()?.replace?.(/[^a-z0-9]+/g, "-"),
      icon: form?.icon,
      description: form?.description,
    };
    try {
      const url = editing ? `/api/admin/categories/${editing?.id}` : "/api/admin/categories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Updated" : "Created");
      setShowModal(false);
      load();
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category? This may fail if it has products.")) return;
    try {
      const r = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error("Failed to delete");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>Categories</h1>
          <p style={{ fontSize: 14, color: textSecondary }}>Organize your product catalog</p>
        </div>
        <button
          onClick={() => open(null)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition text-white"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8" style={{ color: textSecondary }}>Loading...</div>
        ) : (
          categories?.map((c) => (
            <div
              key={c?.id}
              style={{
                background: cardBg,
                borderRadius: 16,
                padding: 20,
                border: `1px solid ${cardBorder}`,
                transition: "border 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.border = `1px solid ${isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.6)'}`)}
              onMouseLeave={(e) => (e.currentTarget.style.border = `1px solid ${cardBorder}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => open(c)}
                    style={{ padding: 8, borderRadius: 8, color: "#22d3ee" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(6,182,212,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(c?.id ?? "")}
                    style={{ padding: 8, borderRadius: 8, color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: textPrimary }}>{c?.name}</h3>
              <p style={{ fontSize: 14, color: textSecondary, marginTop: 4 }}>{c?.description ?? "No description"}</p>
              <div style={{ marginTop: 12, fontSize: 12, color: "#22d3ee", fontWeight: 600 }}>
                {c?._count?.products ?? 0} products
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div style={{ background: modalBgColor, borderRadius: 16, width: "100%", maxWidth: 500, border: `1px solid ${cardBorder}`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>
                  {editing ? "Edit Category" : "Add Category"}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ padding: 8, borderRadius: 8, color: textSecondary }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={submit} className="p-5 space-y-4">
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Name</label>
                  <input
                    required
                    value={form?.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Slug (optional)</label>
                  <input
                    value={form?.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Icon (Lucide name)</label>
                  <input
                    value={form?.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. Smartphone"
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Description</label>
                  <textarea
                    rows={3}
                    value={form?.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    {editing ? "Update" : "Create"}
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
