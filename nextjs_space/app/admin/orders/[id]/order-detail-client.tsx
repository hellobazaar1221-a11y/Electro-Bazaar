"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, User, AlertTriangle, FileText, Upload, Download, CheckCircle } from "lucide-react";
import { formatRupees, ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/format";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInvoice(true);
    const fd = new FormData();
    fd.append("files", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url = data?.urls?.[0];
      if (url) {
        // PATCH the order to update invoiceUrl
        const updateRes = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceUrl: url }),
        });
        if (!updateRes.ok) throw new Error("Failed to update order");
        toast.success("Invoice uploaded successfully");
        load();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload invoice");
    } finally {
      setUploadingInvoice(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order?.invoiceUrl) return;
    try {
      const url = order.invoiceUrl;
      const fileName = `invoice-${order.orderNumber || order.id}.pdf`;
      if (url.startsWith("data:")) {
        const parts = url.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "application/pdf";
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      window.open(order.invoiceUrl, "_blank");
    }
  };

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
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`);
      const d = await r.json();
      setOrder(d?.order ?? null);
      setNewStatus(d?.order?.status ?? "");
    } catch (e) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const updateStatus = async () => {
    if (!newStatus || newStatus === order?.status) return;
    setUpdating(true);
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) throw new Error();
      toast.success("Status updated");
      load();
    } catch (e) {
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const tableBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  if (loading) {
    return <div className="text-center py-12" style={{ color: textSecondary }}>Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-12" style={{ color: textSecondary }}>Order not found</div>;
  }

  const address = order?.shippingAddress ?? {};
  const currentIdx = ORDER_STATUSES?.findIndex((s) => s === order?.status) ?? 0;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <Link
        href="/admin/orders"
        style={{ color: textSecondary }}
        className="inline-flex items-center gap-2 hover:opacity-80 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>Order {order?.orderNumber}</h1>
          <p style={{ fontSize: 14, color: textSecondary }}>
            Placed on {new Date(order?.createdAt ?? "").toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textPrimary,
              borderRadius: 8,
              padding: "8px 12px",
              outline: "none",
              fontSize: 14,
              flex: 1
            }}
          >
            {ORDER_STATUSES?.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS?.[s] ?? s}
              </option>
            ))}
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={updateStatus}
            disabled={updating || newStatus === order?.status}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 text-white shrink-0 shadow-lg hover:shadow-cyan-500/20 transition"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 16 }} className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" /> Tracking Status
        </h3>
        {order?.status === "CANCELLED" ? (
          <div className="bg-red-500/10 text-red-500 p-6 rounded-xl border border-red-500/20 text-center font-bold text-base flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
            ORDER CANCELLED
          </div>
        ) : (
          <div className="space-y-3 max-w-lg">
            {ORDER_STATUSES?.map((s, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold"
                    style={{
                      background: done
                        ? "linear-gradient(to bottom right, #22d3ee, #2563eb)"
                        : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      color: done ? "#ffffff" : textSecondary,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: current ? 600 : 400,
                      color: current ? "#22d3ee" : done ? textPrimary : textSecondary,
                    }}
                  >
                    {ORDER_STATUS_LABELS?.[s] ?? s}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Box */}
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 12 }} className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Customer
          </h3>
          <div style={{ fontSize: 14, color: textPrimary }} className="space-y-1">
            <div style={{ fontWeight: 500 }}>{order?.user?.name}</div>
            <div style={{ color: textSecondary }}>{order?.user?.email}</div>
            <div style={{ color: textSecondary }}>{order?.user?.phone ?? "-"}</div>
          </div>
        </div>

        {/* Shipping Box */}
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 12 }} className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Shipping Address
          </h3>
          <div style={{ fontSize: 14, color: textPrimary }} className="space-y-1">
            <div style={{ fontWeight: 500 }}>{address?.fullName}</div>
            <div style={{ color: textSecondary }}>{address?.phone}</div>
            <div style={{ color: textSecondary }}>
              {address?.line1}
              {address?.line2 ? `, ${address?.line2}` : ""}
            </div>
            <div style={{ color: textSecondary }}>
              {address?.city}, {address?.state} {address?.pincode}
            </div>
          </div>
        </div>

        {/* Payment Box */}
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 12 }} className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" /> Payment
          </h3>
          <div style={{ fontSize: 14, color: textPrimary }} className="space-y-1">
            <div style={{ color: textSecondary }}>Method: <span style={{ color: textPrimary, fontWeight: 500 }}>{order?.paymentMethod}</span></div>
            <div style={{ color: textSecondary }}>Status: <span style={{ color: textPrimary, fontWeight: 500 }}>{order?.paymentStatus}</span></div>
            <div className="font-semibold mt-2 text-base" style={{ color: isDark ? "#34d399" : "#059669" }}>
              {formatRupees(order?.total ?? 0)}
            </div>
          </div>
        </div>

        {/* Invoice Management Box */}
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 12 }} className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Invoice
          </h3>
          <div className="space-y-3">
            {order?.invoiceUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <CheckCircle className="w-4 h-4" /> Invoice Uploaded
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={handleDownloadInvoice}
                    className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition cursor-pointer border-none outline-none"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <label className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Replace
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleInvoiceUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p style={{ fontSize: 12, color: textSecondary }}>No invoice uploaded yet.</p>
                <label className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition cursor-pointer shadow-lg hover:shadow-cyan-500/20">
                  {uploadingInvoice ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload Invoice (PDF)
                    </>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleInvoiceUpload}
                    disabled={uploadingInvoice}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Box */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 16 }}>Items</h3>
        <div className="space-y-3">
          {(order?.items ?? [])?.map((item: any) => (
            <div
              key={item?.id}
              style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                border: `1px solid ${tableBorder}`,
                borderRadius: 12,
                padding: 12
              }}
              className="flex items-center gap-3"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: inputBg }}>
                {(item?.image || item?.product?.image) && (
                  <Image
                    src={item?.image || item?.product?.image}
                    alt={item?.name || item?.product?.name || ""}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontWeight: 500, color: textPrimary }} className="truncate">
                  {item?.name || item?.product?.name || "Product"}
                </div>
                <div style={{ fontSize: 13, color: textSecondary }}>
                  Qty: {item?.quantity} × {formatRupees(item?.price ?? 0)}
                </div>
              </div>
              <div style={{ fontWeight: 600, color: textPrimary }} className="whitespace-nowrap">
                {formatRupees((item?.price ?? 0) * (item?.quantity ?? 0))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 space-y-2 text-sm" style={{ borderTop: `1px solid ${tableBorder}` }}>
          <div className="flex justify-between" style={{ color: textSecondary }}>
            <span>Subtotal</span>
            <span style={{ color: textPrimary }}>{formatRupees(order?.subtotal ?? 0)}</span>
          </div>
          <div className="flex justify-between" style={{ color: textSecondary }}>
            <span>GST</span>
            <span style={{ color: textPrimary }}>{formatRupees(order?.tax ?? 0)}</span>
          </div>
          <div className="flex justify-between" style={{ color: textSecondary }}>
            <span>Shipping</span>
            <span style={{ color: textPrimary }}>{formatRupees(order?.shipping ?? 0)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: `1px solid ${tableBorder}` }}>
            <span style={{ color: textPrimary }}>Total</span>
            <span style={{ color: "#22d3ee" }}>{formatRupees(order?.total ?? 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
