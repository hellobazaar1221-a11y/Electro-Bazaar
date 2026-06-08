"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import { formatRupees } from "@/lib/format";
import { motion } from "framer-motion";

const COLORS = ["#60B5FF", "#FF9149", "#FF9898", "#FF90BB", "#80D8C3", "#A19AD3"];

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
  dailyRevenue: { date: string; revenue: number }[];
  categoryStats: { name: string; count: number }[];
  topProducts: any[];
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to theme changes
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
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Theme-aware colors
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const tableBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const chartTickColor = isDark ? "#94a3b8" : "#64748b";

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Page Title skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded" style={{ background: isDark ? "#334155" : "#cbd5e1" }} />
          <div className="h-4 w-64 rounded" style={{ background: isDark ? "#1e293b" : "#e2e8f0" }} />
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl border" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="w-12 h-12 rounded-xl mb-3" style={{ background: isDark ? "#334155" : "#cbd5e1" }} />
              <div className="h-3 w-16 rounded mb-2" style={{ background: isDark ? "#1e293b" : "#e2e8f0" }} />
              <div className="h-6 w-24 rounded" style={{ background: isDark ? "#334155" : "#cbd5e1" }} />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-2xl border h-80" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="h-5 w-40 rounded mb-6" style={{ background: isDark ? "#334155" : "#cbd5e1" }} />
              <div className="w-full h-56 rounded" style={{ background: isDark ? "#1e293b" : "#f1f5f9" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Revenue",
      value: formatRupees(stats?.totalRevenue ?? 0),
      icon: IndianRupee,
      color: "from-emerald-400 to-teal-600",
    },
    {
      label: "Total Orders",
      value: String(stats?.totalOrders ?? 0),
      icon: ShoppingBag,
      color: "from-cyan-400 to-blue-600",
    },
    {
      label: "Products",
      value: String(stats?.totalProducts ?? 0),
      icon: Package,
      color: "from-purple-400 to-pink-600",
    },
    {
      label: "Customers",
      value: String(stats?.totalCustomers ?? 0),
      icon: Users,
      color: "from-orange-400 to-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: textPrimary }}>Dashboard</h1>
        <p style={{ color: textSecondary, marginTop: 4 }}>Welcome back. Here is your store at a glance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards?.map((card, i) => {
          const Icon = card?.icon;
          return (
            <motion.div
              key={card?.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: cardBg,
                borderRadius: 16,
                padding: 20,
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
                transition: "background 0.3s, border 0.3s",
              }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card?.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div style={{ fontSize: 11, color: textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>
                {card?.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: textPrimary, marginTop: 4 }}>
                {card?.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp style={{ width: 18, height: 18, color: "#22d3ee" }} />
            Revenue (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.dailyRevenue ?? []}>
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: chartTickColor }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: chartTickColor }} tickFormatter={(v: number) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textPrimary }}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#60B5FF" strokeWidth={2.5} dot={{ r: 3, fill: "#60B5FF" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
            <Package style={{ width: 18, height: 18, color: "#22d3ee" }} />
            Products by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11, color: textSecondary }} />
                <Pie data={stats?.categoryStats ?? []} dataKey="count" nameKey="name" cx="50%" cy="55%" outerRadius={70}>
                  {(stats?.categoryStats ?? [])?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textPrimary }}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${tableBorder}`, boxShadow: cardShadow }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: 16, color: textPrimary, fontSize: 16 }}>Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tableBorder}` }}>
                <th style={{ textAlign: "left", paddingBottom: 12, paddingTop: 4, color: textSecondary, fontWeight: 600, fontSize: 12 }}>Order #</th>
                <th style={{ textAlign: "left", paddingBottom: 12, paddingTop: 4, color: textSecondary, fontWeight: 600, fontSize: 12 }}>Customer</th>
                <th style={{ textAlign: "left", paddingBottom: 12, paddingTop: 4, color: textSecondary, fontWeight: 600, fontSize: 12 }}>Status</th>
                <th style={{ textAlign: "right", paddingBottom: 12, paddingTop: 4, color: textSecondary, fontWeight: 600, fontSize: 12 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders ?? [])?.map((order: any) => (
                <tr key={order?.id} style={{ borderBottom: `1px solid ${tableBorder}` }}>
                  <td style={{ paddingTop: 12, paddingBottom: 12, fontFamily: "monospace", fontSize: 12, color: textPrimary }}>{order?.orderNumber}</td>
                  <td style={{ paddingTop: 12, paddingBottom: 12, color: textPrimary }}>{order?.user?.name ?? "-"}</td>
                  <td style={{ paddingTop: 12, paddingBottom: 12 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(6,182,212,0.12)", color: "#22d3ee", fontSize: 11, fontWeight: 600 }}>
                      {order?.status?.replace?.(/_/g, " ") ?? "-"}
                    </span>
                  </td>
                  <td style={{ paddingTop: 12, paddingBottom: 12, textAlign: "right", fontWeight: 700, color: textPrimary }}>
                    {formatRupees(order?.total ?? 0)}
                  </td>
                </tr>
              ))}
              {(stats?.recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ paddingTop: 24, paddingBottom: 24, textAlign: "center", color: textSecondary }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
