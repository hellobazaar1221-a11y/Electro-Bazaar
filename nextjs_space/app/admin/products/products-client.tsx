"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Sliders, CheckSquare, Square, Save, RotateCcw, AlertTriangle, Layers } from "lucide-react";
import { formatRupees } from "@/lib/format";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  brand?: string | null;
  image: string;
  rating?: number;
  category?: Category;
  categoryId: string;
  featured?: boolean;
  inStock?: boolean;
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTab, setBulkTab] = useState<"fields" | "stock">("fields");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Bulk fields form
  const [applyToAll, setApplyToAll] = useState(false);
  const [priceChangeType, setPriceChangeType] = useState<"" | "set" | "add" | "percent_add" | "percent_sub">("");
  const [priceChangeValue, setPriceChangeValue] = useState("");
  const [stockChangeType, setStockChangeType] = useState<"" | "set" | "add">("");
  const [stockChangeValue, setStockChangeValue] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkFeatured, setBulkFeatured] = useState<"none" | "featured" | "standard">("none");
  const [bulkBrand, setBulkBrand] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [bulkOriginalPriceChangeType, setBulkOriginalPriceChangeType] = useState<"" | "set" | "remove">("");
  const [bulkOriginalPriceChangeValue, setBulkOriginalPriceChangeValue] = useState("");

  // Full Stock Quick-Editor State
  const [bulkStockMap, setBulkStockMap] = useState<Record<string, string>>({});
  const [bulkPriceMap, setBulkPriceMap] = useState<Record<string, string>>({});
  const [bulkNameMap, setBulkNameMap] = useState<Record<string, string>>({});
  const [stockSearch, setStockSearch] = useState("");

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

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    brand: "",
    image: "",
    categoryId: "",
    featured: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const p = await pRes.json();
      const c = await cRes.json();
      const loadedProducts = p?.products ?? [];
      setProducts(loadedProducts);
      setCategories(c?.categories ?? []);

      // Pre-fill bulk maps
      const stockMap: Record<string, string> = {};
      const priceMap: Record<string, string> = {};
      const nameMap: Record<string, string> = {};
      loadedProducts.forEach((prod: Product) => {
        stockMap[prod.id] = String(prod.stock);
        priceMap[prod.id] = String(prod.price);
        nameMap[prod.id] = prod.name;
      });
      setBulkStockMap(stockMap);
      setBulkPriceMap(priceMap);
      setBulkNameMap(nameMap);
    } catch (e) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      originalPrice: "",
      stock: "",
      brand: "",
      image: "",
      categoryId: categories?.[0]?.id ?? "",
      featured: false,
    });
    setUploadedImages([]);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormData({
      name: p?.name ?? "",
      slug: p?.slug ?? "",
      description: p?.description ?? "",
      price: String(p?.price ?? ""),
      originalPrice: p?.originalPrice != null ? String(p?.originalPrice) : "",
      stock: String(p?.stock ?? 0),
      brand: p?.brand ?? "",
      image: p?.image ?? "",
      categoryId: p?.categoryId ?? "",
      featured: p?.featured ?? false,
    });
    setUploadedImages((p as any)?.images || (p?.image ? [p.image] : []));
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data?.urls) {
        setUploadedImages((prev) => [...prev, ...data.urls]);
        toast.success("Images uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    const payload = {
      name: formData?.name,
      slug: formData?.slug || formData?.name?.toLowerCase?.()?.replace?.(/[^a-z0-9]+/g, "-"),
      description: formData?.description,
      price: Number(formData?.price) || 0,
      originalPrice: formData?.originalPrice ? Number(formData?.originalPrice) : null,
      stock: Number(formData?.stock) || 0,
      brand: formData?.brand,
      image: uploadedImages[0] ?? "",
      images: uploadedImages,
      categoryId: formData?.categoryId,
      featured: formData?.featured,
    };
    try {
      const url = editing ? `/api/admin/products/${editing?.id}` : "/api/admin/products";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(editing ? "Product updated" : "Product created");
      setShowModal(false);
      load();
    } catch (e) {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product deleted");
      setSelectedIds(prev => prev.filter(x => x !== id));
      load();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  // Bulk operation actions
  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targets = applyToAll ? products.map(p => p.id) : selectedIds;
    if (targets.length === 0) {
      toast.error("No products selected");
      return;
    }

    setBulkSubmitting(true);
    try {
      const payload: any = {
        action: "edit_fields",
        ids: targets,
        data: {},
      };

      if (priceChangeType && priceChangeValue !== "") {
        payload.data.priceChangeType = priceChangeType;
        payload.data.priceChangeValue = Number(priceChangeValue);
      }

      if (stockChangeType && stockChangeValue !== "") {
        payload.data.stockChangeType = stockChangeType;
        payload.data.stockChangeValue = Number(stockChangeValue);
      }

      if (bulkCategoryId) {
        payload.data.categoryId = bulkCategoryId;
      }

      if (bulkFeatured !== "none") {
        payload.data.featured = bulkFeatured === "featured";
      }

      if (bulkBrand) {
        payload.data.brand = bulkBrand;
      }

      if (bulkDescription) {
        payload.data.description = bulkDescription;
      }

      if (bulkOriginalPriceChangeType) {
        payload.data.originalPriceChangeType = bulkOriginalPriceChangeType;
        if (bulkOriginalPriceChangeType === "set" && bulkOriginalPriceChangeValue !== "") {
          payload.data.originalPriceChangeValue = Number(bulkOriginalPriceChangeValue);
        }
      }

      const res = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Bulk update failed");
      const data = await res.json();
      toast.success(`Successfully updated ${data.count} products`);
      setShowBulkModal(false);
      setSelectedIds([]);
      
      // Reset forms
      setPriceChangeType("");
      setPriceChangeValue("");
      setStockChangeType("");
      setStockChangeValue("");
      setBulkCategoryId("");
      setBulkFeatured("none");
      setBulkBrand("");
      setBulkDescription("");
      setBulkOriginalPriceChangeType("");
      setBulkOriginalPriceChangeValue("");
      setApplyToAll(false);

      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update products in bulk");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      const payload = {
        action: "update_stock",
        data: {
          stockMap: bulkStockMap,
          priceMap: bulkPriceMap,
          nameMap: bulkNameMap,
        },
      };

      const res = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Bulk spreadsheet update failed");
      const data = await res.json();
      toast.success(`Successfully updated ${data.count} products`);
      setShowBulkModal(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update catalog spreadsheet");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No products selected to delete");
      return;
    }
    if (!confirm(`Are you absolutely sure you want to permanently delete the ${selectedIds.length} selected products? This cannot be undone.`)) return;

    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          ids: selectedIds,
        }),
      });

      if (!res.ok) throw new Error("Bulk deletion failed");
      toast.success("Selected products deleted successfully");
      setSelectedIds([]);
      setShowBulkModal(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete products in bulk");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = products?.filter((p) =>
    p?.name?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "") ||
    p?.brand?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "")
  );

  const toggleSelectAll = () => {
    const filteredIds = filtered.map((p) => p.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const next = [...prev];
        filteredIds.forEach((id) => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const isAllSelected =
    filtered?.length > 0 && filtered.every((p) => selectedIds.includes(p.id));

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const tableBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(15,23,42,0.5)" : "rgba(241,245,249,0.8)";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const modalBgColor = isDark ? "#1e293b" : "#ffffff";

  // Filter products specifically in the stock quick sheet view
  const filteredForStockSheet = products?.filter((p) =>
    p?.name?.toLowerCase?.()?.includes?.(stockSearch?.toLowerCase?.() ?? "") ||
    p?.brand?.toLowerCase?.()?.includes?.(stockSearch?.toLowerCase?.() ?? "")
  );

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      <Toaster position="top-right" />
      
      {/* Header and Control Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>Products</h1>
          <p style={{ fontSize: 14, color: textSecondary }}>Manage your store catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              // Pre-fill quick editing maps
              const stockMap: Record<string, string> = {};
              const priceMap: Record<string, string> = {};
              const nameMap: Record<string, string> = {};
              products.forEach((prod) => {
                stockMap[prod.id] = String(prod.stock);
                priceMap[prod.id] = String(prod.price);
                nameMap[prod.id] = prod.name;
              });
              setBulkStockMap(stockMap);
              setBulkPriceMap(priceMap);
              setBulkNameMap(nameMap);
              setBulkTab(selectedIds.length > 0 ? "fields" : "stock");
              setShowBulkModal(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/30 transition text-white text-sm"
          >
            <Sliders className="w-4 h-4" /> Bulk Editor
          </button>
          
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition text-white text-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: textSecondary }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or brand..."
          style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "10px 16px 10px 44px", color: textPrimary, outline: "none" }}
        />
      </div>

      {/* Selection floating status bar for all screens */}
      {selectedIds.length > 0 && (
        <div 
          className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 px-4 py-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 w-[92%] max-w-lg"
          style={{
            background: isDark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)",
            borderColor: isDark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.6)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: textPrimary }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
              {selectedIds.length}
            </span>
            <span>selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBulkTab("fields");
                setShowBulkModal(true);
              }}
              className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
            >
              Bulk Action
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-full text-xs font-bold border transition hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: textSecondary, borderColor: inputBorder }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Products list card container */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: textSecondary }}>Loading...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead style={{ background: theadBg, color: textSecondary }}>
                  <tr>
                    <th style={{ padding: "12px 16px", width: 48, textAlign: "center" }}>
                      <button 
                        type="button" 
                        onClick={toggleSelectAll} 
                        style={{ color: isAllSelected ? "#6366f1" : textSecondary }}
                      >
                        {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Product</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Category</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Price</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Stock</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <tr
                        key={p?.id}
                        style={{ 
                          borderTop: `1px solid ${tableBorder}`, 
                          transition: "background 0.2s",
                          background: isSelected ? (isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)") : "transparent"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = rowHoverBg;
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <button 
                            type="button" 
                            onClick={() => toggleSelect(p.id)} 
                            style={{ color: isSelected ? "#6366f1" : textSecondary }}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: inputBg }}>
                              {p?.image && (
                                <Image
                                  src={p?.image}
                                  alt={p?.name ?? ""}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: textPrimary }}>{p?.name}</div>
                              <div style={{ fontSize: 12, color: textSecondary }}>{p?.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", color: textSecondary }}>{p?.category?.name ?? "-"}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: textPrimary }}>
                          {formatRupees(p?.price ?? 0)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <span
                            style={{
                              padding: "4px 8px", borderRadius: 4, fontSize: 12,
                              background: (p?.stock ?? 0) > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                              color: (p?.stock ?? 0) > 0 ? "#10b981" : "#ef4444"
                            }}
                          >
                            {p?.stock ?? 0}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              style={{ padding: 8, borderRadius: 8, color: "#22d3ee" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(6,182,212,0.1)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p?.id ?? "")}
                              style={{ padding: 8, borderRadius: 8, color: "#ef4444" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: "center", color: textSecondary }}>
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="flex items-center justify-between p-3" style={{ borderBottom: `1px solid ${tableBorder}`, background: theadBg }}>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color: textSecondary }}
                >
                  {isAllSelected ? <CheckSquare className="w-4.5 h-4.5 text-indigo-500" /> : <Square className="w-4.5 h-4.5" />}
                  Select All Filtered
                </button>
              </div>

              {filtered?.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div 
                    key={p?.id} 
                    className="p-4 space-y-3 relative transition-colors duration-200" 
                    style={{ 
                      borderBottom: `1px solid ${tableBorder}`,
                      background: isSelected ? (isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)") : "transparent"
                    }}
                  >
                    {/* Checkbox Floating Selector on Mobile */}
                    <button
                      onClick={() => toggleSelect(p.id)}
                      className="absolute top-4 left-4 z-10 rounded-md bg-slate-900/10 dark:bg-white/10"
                      style={{ color: isSelected ? "#6366f1" : textSecondary }}
                    >
                      {isSelected ? <CheckSquare className="w-5 h-5 bg-white dark:bg-slate-900 rounded" /> : <Square className="w-5 h-5 bg-white dark:bg-slate-900 rounded" />}
                    </button>

                    <div className="flex items-center gap-3 pl-8">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: inputBg, border: `1px solid ${tableBorder}` }}>
                        {p?.image && (
                          <Image
                            src={p?.image}
                            alt={p?.name ?? ""}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontWeight: 600, color: textPrimary, fontSize: 14 }} className="truncate">{p?.name}</div>
                        <div style={{ fontSize: 12, color: textSecondary }}>{p?.brand} · {p?.category?.name ?? "-"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 pl-8" style={{ borderTop: `1px solid ${tableBorder}` }}>
                      <div className="flex items-baseline gap-2">
                        <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                          {formatRupees(p?.price ?? 0)}
                        </div>
                        {p?.originalPrice && (
                          <div style={{ fontSize: 12, color: textSecondary, textDecoration: "line-through" }}>
                            {formatRupees(p.originalPrice)}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: (p?.stock ?? 0) > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          color: (p?.stock ?? 0) > 0 ? "#10b981" : "#ef4444"
                        }}
                      >
                        Stock: {p?.stock ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => openEdit(p)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, color: "#22d3ee", background: "rgba(6,182,212,0.1)", fontSize: 12, fontWeight: 500 }}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p?.id ?? "")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, color: "#ef4444", background: "rgba(239,68,68,0.1)", fontSize: 12, fontWeight: 500 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered?.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: textSecondary }}>
                  No products found
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Single Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div style={{ background: modalBgColor, borderRadius: 16, width: "100%", maxWidth: 672, border: `1px solid ${tableBorder}`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)", position: "relative" }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${tableBorder}` }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>
                  {editing ? "Edit Product" : "Add Product"}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ padding: 8, borderRadius: 8, color: textSecondary }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Name</label>
                    <input
                      required
                      value={formData?.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Slug (optional)</label>
                    <input
                      value={formData?.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData?.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>MRP (₹)</label>
                    <input
                      type="number"
                      value={formData?.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Selling Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={formData?.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Stock</label>
                    <input
                      required
                      type="number"
                      value={formData?.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Brand</label>
                    <input
                      value={formData?.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Category</label>
                    <select
                      required
                      value={formData?.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                    >
                      <option value="">Select category</option>
                      {categories?.map((c) => (
                        <option key={c?.id} value={c?.id}>
                          {c?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Product Images</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="images-upload"
                        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${inputBorder}`, borderRadius: 8, padding: 20, cursor: "pointer", background: inputBg, transition: "border 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.border = `2px dashed ${isDark ? "rgba(6,182,212,0.5)" : "rgba(6,182,212,0.8)"}`)}
                        onMouseLeave={(e) => (e.currentTarget.style.border = `2px dashed ${inputBorder}`)}
                      >
                        {uploading ? (
                          <div className="flex items-center gap-2" style={{ color: textSecondary, fontWeight: 500 }}>
                            <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <Plus className="w-6 h-6 mb-1.5" style={{ color: textSecondary }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>Click to upload images</span>
                            <span style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>PNG, JPG, JPEG, WEBP</span>
                          </div>
                        )}
                      </label>
                      <input
                        type="file"
                        id="images-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {uploadedImages.map((url, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden group shadow-md"
                            style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
                          >
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-cyan-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded leading-none shadow">
                                Main
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData?.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" style={{ fontSize: 14, color: textSecondary }}>
                    Featured product
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: `1px solid ${tableBorder}` }}>
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

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div style={{ background: modalBgColor, borderRadius: 16, width: "100%", maxWidth: bulkTab === "stock" ? 800 : 600, border: `1px solid ${tableBorder}`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)", position: "relative" }}>
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${tableBorder}` }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }} className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-500" /> Catalog Bulk Operations
                  </h2>
                  <p style={{ fontSize: 12, color: textSecondary }}>
                    Perform batch operations on products catalog
                  </p>
                </div>
                <button onClick={() => setShowBulkModal(false)} style={{ padding: 8, borderRadius: 8, color: textSecondary }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b text-sm" style={{ borderColor: tableBorder }}>
                <button
                  onClick={() => setBulkTab("fields")}
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${bulkTab === "fields" ? "border-b-2 border-indigo-500 text-indigo-500" : ""}`}
                  style={{ color: bulkTab === "fields" ? undefined : textSecondary }}
                >
                  Bulk Field Editor ({selectedIds.length} Selected)
                </button>
                <button
                  onClick={() => setBulkTab("stock")}
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${bulkTab === "stock" ? "border-b-2 border-indigo-500 text-indigo-500" : ""}`}
                  style={{ color: bulkTab === "stock" ? undefined : textSecondary }}
                >
                  Full Stock Spreadsheet
                </button>
              </div>

              {/* Tab Content: Bulk Fields Editor */}
              {bulkTab === "fields" && (
                <form onSubmit={handleBulkEditSubmit} className="p-5 space-y-4">
                  {selectedIds.length === 0 && !applyToAll ? (
                    <div className="p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center space-y-3" style={{ borderColor: inputBorder, background: inputBg }}>
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                      <div className="text-sm font-semibold" style={{ color: textPrimary }}>No products selected</div>
                      <div className="text-xs max-w-xs" style={{ color: textSecondary }}>
                        Select products first from the list using checkboxes, or enable the option below to apply changes to ALL products in stock.
                      </div>
                      <button
                        type="button"
                        onClick={() => setApplyToAll(true)}
                        className="px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-semibold text-xs transition"
                      >
                        Apply to ALL {products.length} Products
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Selection Status Banner */}
                      <div className="p-3 rounded-lg flex items-center justify-between text-xs font-semibold" style={{ background: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.05)", border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.3)"}` }}>
                        <span style={{ color: textPrimary }}>
                          {applyToAll ? `Applying changes to ALL ${products.length} products.` : `Applying changes to the ${selectedIds.length} selected products.`}
                        </span>
                        {!applyToAll && selectedIds.length === 0 && (
                          <span className="text-red-500">Error: Select items or all.</span>
                        )}
                        {selectedIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setApplyToAll(!applyToAll)}
                            className="text-indigo-500 underline"
                          >
                            {applyToAll ? "Switch back to Selected Only" : "Switch to ALL Products"}
                          </button>
                        )}
                      </div>

                      {/* Bulk Fields List */}
                      <div className="space-y-4">
                        {/* Price Change Row */}
                        <div className="grid sm:grid-cols-2 gap-3 items-end">
                          <div>
                            <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Bulk Price Adjustment</label>
                            <select
                              value={priceChangeType}
                              onChange={(e) => setPriceChangeType(e.target.value as any)}
                              style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                            >
                              <option value="">No Change (Keep Current Price)</option>
                              <option value="set">Set to Fixed Value (e.g. ₹499)</option>
                              <option value="add">Add Value (e.g. Current Price + ₹50)</option>
                              <option value="percent_add">Increase by Percentage (e.g. Current Price + 10%)</option>
                              <option value="percent_sub">Decrease by Percentage (e.g. Current Price - 10%)</option>
                            </select>
                          </div>
                          {priceChangeType && (
                            <div>
                              <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>
                                {priceChangeType.includes("percent") ? "Percentage Value (%)" : "Rupee Value (₹)"}
                              </label>
                              <input
                                required
                                type="number"
                                step="any"
                                placeholder={priceChangeType.includes("percent") ? "e.g. 10 for 10%" : "e.g. 150"}
                                value={priceChangeValue}
                                onChange={(e) => setPriceChangeValue(e.target.value)}
                                style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Stock Adjustment Row */}
                        <div className="grid sm:grid-cols-2 gap-3 items-end">
                          <div>
                            <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Bulk Stock Adjustment</label>
                            <select
                              value={stockChangeType}
                              onChange={(e) => setStockChangeType(e.target.value as any)}
                              style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                            >
                              <option value="">No Change (Keep Current Stock)</option>
                              <option value="set">Set Stock to Fixed Quantity (e.g. 100)</option>
                              <option value="add">Add Quantity to Stock (e.g. Current + 10)</option>
                            </select>
                          </div>
                          {stockChangeType && (
                            <div>
                              <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Quantity</label>
                              <input
                                required
                                type="number"
                                placeholder="e.g. 50"
                                value={stockChangeValue}
                                onChange={(e) => setStockChangeValue(e.target.value)}
                                style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Category Row */}
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Change Category To</label>
                          <select
                            value={bulkCategoryId}
                            onChange={(e) => setBulkCategoryId(e.target.value)}
                            style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                          >
                            <option value="">No Change (Keep Current Categories)</option>
                            {categories?.map((c) => (
                              <option key={c?.id} value={c?.id}>
                                {c?.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Featured Toggles */}
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Featured Badge</label>
                          <select
                            value={bulkFeatured}
                            onChange={(e) => setBulkFeatured(e.target.value as any)}
                            style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                          >
                            <option value="none">No Change (Keep Current)</option>
                            <option value="featured">Set all to Featured</option>
                            <option value="standard">Remove all from Featured</option>
                          </select>
                        </div>

                        {/* Brand Row */}
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Change Brand To</label>
                          <input
                            type="text"
                            placeholder="e.g. Apple, Sony (Leave blank for no change)"
                            value={bulkBrand}
                            onChange={(e) => setBulkBrand(e.target.value)}
                            style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                          />
                        </div>

                        {/* Original Price (Strike-through Price) Row */}
                        <div className="grid sm:grid-cols-2 gap-3 items-end">
                          <div>
                            <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Original Price Adjustment</label>
                            <select
                              value={bulkOriginalPriceChangeType}
                              onChange={(e) => setBulkOriginalPriceChangeType(e.target.value as any)}
                              style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                            >
                              <option value="">No Change (Keep Current Original Price)</option>
                              <option value="set">Set to Fixed Value (e.g. ₹999)</option>
                              <option value="remove">Remove Original Price (No discount badge)</option>
                            </select>
                          </div>
                          {bulkOriginalPriceChangeType === "set" && (
                            <div>
                              <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Original Price Value (₹)</label>
                              <input
                                required
                                type="number"
                                placeholder="e.g. 1200"
                                value={bulkOriginalPriceChangeValue}
                                onChange={(e) => setBulkOriginalPriceChangeValue(e.target.value)}
                                style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Description Row */}
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: textSecondary, marginBottom: 4 }}>Change Description To</label>
                          <textarea
                            placeholder="Type new description here (Leave blank for no change)"
                            value={bulkDescription}
                            onChange={(e) => setBulkDescription(e.target.value)}
                            rows={3}
                            style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none", resize: "none" }}
                          />
                        </div>
                      </div>

                      {/* Modal Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-6" style={{ borderTop: `1px solid ${tableBorder}` }}>
                        <div>
                          {selectedIds.length > 0 && (
                            <button
                              type="button"
                              onClick={handleBulkDelete}
                              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-semibold text-sm transition flex items-center gap-1.5"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowBulkModal(false)}
                            style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${inputBorder}`, color: textPrimary, background: "transparent" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={bulkSubmitting}
                            className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white transition shadow-lg hover:shadow-indigo-500/20"
                          >
                            {bulkSubmitting ? "Updating..." : "Apply Bulk Updates"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Tab Content: Full Stock spreadsheet-like editor */}
              {bulkTab === "stock" && (
                <form onSubmit={handleBulkStockSubmit} className="p-5 space-y-4">
                  {/* Internal Filter Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
                    <input
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      placeholder="Quick filter products in stock sheet..."
                      style={{ width: "100%", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "6px 12px 6px 36px", color: textPrimary, outline: "none", fontSize: 13 }}
                    />
                  </div>

                  {/* Stock spreadsheet container */}
                  <div className="max-h-96 overflow-y-auto border rounded-xl" style={{ borderColor: tableBorder }}>
                    <table className="w-full text-xs font-sans text-left">
                      <thead style={{ background: theadBg, color: textSecondary }}>
                        <tr>
                          <th style={{ padding: "8px 12px", width: 250 }}>Product Name</th>
                          <th style={{ padding: "8px 12px" }}>Brand/Category</th>
                          <th style={{ padding: "8px 12px", width: 120 }}>Price (₹)</th>
                          <th style={{ padding: "8px 12px", width: 120 }}>Stock Value</th>
                          <th style={{ padding: "8px 12px", width: 60 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredForStockSheet?.map((p) => (
                          <tr key={p.id} style={{ borderTop: `1px solid ${tableBorder}` }}>
                            <td style={{ padding: "8px 12px" }} className="font-semibold text-slate-200">
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0" style={{ background: inputBg }}>
                                  {p.image && <img src={p.image} className="object-cover w-full h-full" />}
                                </div>
                                <input
                                  type="text"
                                  value={bulkNameMap[p.id] ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkNameMap(prev => ({
                                      ...prev,
                                      [p.id]: val
                                    }));
                                  }}
                                  style={{
                                    background: inputBg,
                                    border: `1px solid ${inputBorder}`,
                                    borderRadius: 6,
                                    color: textPrimary,
                                    outline: "none",
                                    padding: "4px 8px",
                                    fontSize: 12,
                                    width: "100%",
                                  }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: "8px 12px", color: textSecondary }}>
                              {p.brand || "Electro"} / {p.category?.name || "-"}
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={bulkPriceMap[p.id] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBulkPriceMap(prev => ({
                                    ...prev,
                                    [p.id]: val
                                  }));
                                }}
                                style={{
                                  width: "90px",
                                  padding: "4px 8px",
                                  background: inputBg,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 6,
                                  color: textPrimary,
                                  outline: "none",
                                  textAlign: "right"
                                }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input
                                type="number"
                                min="0"
                                value={bulkStockMap[p.id] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBulkStockMap(prev => ({
                                    ...prev,
                                    [p.id]: val
                                  }));
                                }}
                                style={{
                                  width: "80px",
                                  padding: "4px 8px",
                                  background: inputBg,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 6,
                                  color: textPrimary,
                                  outline: "none",
                                  textAlign: "center"
                                }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <button
                                type="button"
                                title="Reset row to current db values"
                                onClick={() => {
                                  setBulkNameMap(prev => ({ ...prev, [p.id]: p.name }));
                                  setBulkPriceMap(prev => ({ ...prev, [p.id]: String(p.price) }));
                                  setBulkStockMap(prev => ({ ...prev, [p.id]: String(p.stock) }));
                                }}
                                className="p-1 rounded text-xs hover:bg-slate-700/50"
                                style={{ color: textSecondary }}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredForStockSheet?.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: 24, textAlign: "center", color: textSecondary }}>
                              No products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 mt-6" style={{ borderTop: `1px solid ${tableBorder}` }}>
                    <div className="text-xs" style={{ color: textSecondary }}>
                      Editing catalog values for all {products.length} products
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkModal(false)}
                        style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${inputBorder}`, color: textPrimary, background: "transparent" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={bulkSubmitting}
                        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold text-white transition shadow-lg flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> {bulkSubmitting ? "Saving..." : "Save Catalog Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
