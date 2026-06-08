"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { formatRupees } from "@/lib/format";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user?: { name?: string; email?: string };
  items?: { id: string }[];
}

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d?.orders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders?.filter((o) => {
    const matchesSearch =
      o?.orderNumber?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "") ||
      o?.user?.name?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "") ||
      o?.user?.email?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "");
    const matchesStatus = statusFilter === "ALL" || o?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    "ALL",
    "ORDER_RECEIVED",
    "ORDER_ACCEPTED",
    "INVOICE_GENERATED",
    "PACKAGING_STARTED",
    "PACKAGING_COMPLETED",
    "READY_FOR_DISPATCH",
    "DISPATCHED",
    "IN_TRANSIT",
    "REACHED_LOCAL_HUB",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const tableBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(15,23,42,0.5)" : "rgba(241,245,249,0.8)";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div className="space-y-4">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>Orders</h1>
        <p style={{ fontSize: 14, color: textSecondary }}>All customer orders and their status</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: inputBg,
            border: `1px solid ${inputBorder}`,
            borderRadius: 8,
            padding: "10px 16px",
            color: textPrimary,
            outline: "none"
          }}
        >
          {statusOptions?.map((s) => (
            <option key={s} value={s}>
              {s?.replace?.(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${tableBorder}`, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: textSecondary }}>Loading...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: theadBg, color: textSecondary }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Order #</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Customer</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Items</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Total</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>Payment</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((o) => (
                    <tr
                      key={o?.id}
                      style={{ borderTop: `1px solid ${tableBorder}`, transition: "background 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = rowHoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: textPrimary }}>{o?.orderNumber}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: textPrimary, fontWeight: 500 }}>{o?.user?.name ?? "-"}</div>
                        <div style={{ fontSize: 12, color: textSecondary }}>{o?.user?.email ?? "-"}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: textSecondary }}>{o?.items?.length ?? 0}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: textPrimary }}>
                        {formatRupees(o?.total ?? 0)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(6,182,212,0.1)", color: "#22d3ee", fontSize: 12, whiteSpace: "nowrap" }}>
                          {o?.status?.replace?.(/_/g, " ") ?? "-"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: textSecondary, fontSize: 12 }}>{o?.paymentMethod}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: textSecondary, fontSize: 12 }}>
                        {new Date(o?.createdAt ?? "").toLocaleDateString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Link
                          href={`/admin/orders/${o?.id}`}
                          style={{ display: "inline-flex", alignItems: "center", padding: 8, borderRadius: 8, color: "#22d3ee", background: "rgba(6,182,212,0.1)" }}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 32, textAlign: "center", color: textSecondary }}>
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
              {filtered?.map((o) => (
                <div key={o?.id} className="p-4 space-y-3" style={{ borderBottom: `1px solid ${tableBorder}` }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: textPrimary }}>
                      {o?.orderNumber}
                    </span>
                    <span style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(6,182,212,0.1)", color: "#22d3ee", fontSize: 11, fontWeight: 600 }}>
                      {o?.status?.replace?.(/_/g, " ") ?? "-"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: textSecondary }}>
                    <div style={{ fontWeight: 600, color: textPrimary, marginBottom: 2 }}>{o?.user?.name ?? "-"}</div>
                    <div>{o?.user?.email ?? "-"}</div>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: textSecondary }}>
                    <div>Items: <span style={{ color: textPrimary, fontWeight: 500 }}>{o?.items?.length ?? 0}</span></div>
                    <div>Payment: <span style={{ color: textPrimary, fontWeight: 500 }}>{o?.paymentMethod}</span></div>
                    <div>{new Date(o?.createdAt ?? "").toLocaleDateString("en-IN")}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${tableBorder}` }}>
                    <div>
                      <span style={{ fontSize: 11, color: textSecondary }}>Total</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                        {formatRupees(o?.total ?? 0)}
                      </div>
                    </div>
                    <Link
                      href={`/admin/orders/${o?.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "#22d3ee",
                        background: "rgba(6,182,212,0.1)",
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </div>
                </div>
              ))}
              {filtered?.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: textSecondary }}>
                  No orders found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
