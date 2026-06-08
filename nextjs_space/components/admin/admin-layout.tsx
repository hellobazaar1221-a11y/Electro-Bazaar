"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  Ticket,
  Sun,
  Moon,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    const dark = saved !== "light";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const bg = isDark ? "#0f172a" : "#f1f5f9";
  const headerBg = isDark ? "#1e293b" : "#1e40af";
  const sidebarBg = isDark ? "#1e293b" : "#1e3a8a";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: isDark ? "#fff" : "#0f172a", transition: "background 0.3s, color 0.3s" }}>

      {/* ===== STICKY TOP HEADER (ALL SCREENS) ===== */}
      <header
        style={{ background: headerBg, boxShadow: "0 2px 12px rgba(0,0,0,0.4)", position: "sticky", top: 0, zIndex: 50 }}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        {/* Left: Hamburger (mobile only) + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen
              ? <X className="w-5 h-5 text-white" />
              : <Menu className="w-5 h-5 text-white" />
            }
          </button>
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Electro Bazaar</div>
            <div style={{ fontSize: 11, color: "#93c5fd" }} className="hidden sm:block">Admin Panel</div>
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.3s",
            background: isDark
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : "linear-gradient(135deg, #0f172a, #1e293b)",
            color: isDark ? "#1e293b" : "#f59e0b",
            border: isDark ? "2px solid #fbbf24" : "2px solid #334155",
            boxShadow: isDark ? "0 0 16px rgba(251,191,36,0.5)" : "0 0 16px rgba(15,23,42,0.5)",
          }}
        >
          {isDark ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
          <span className="hidden sm:inline">{isDark ? "LIGHT" : "DARK"}</span>
        </button>
      </header>

      {/* ===== BODY: SIDEBAR + MAIN ===== */}
      <div style={{ display: "flex", position: "relative" }}>

        {/* ===== MOBILE BACKDROP ===== */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              zIndex: 40,
              backdropFilter: "blur(4px)",
            }}
            className="lg:hidden"
          />
        )}

        {/* ===== SIDEBAR ===== */}
        <aside
          style={{
            width: 240,
            background: sidebarBg,
            borderRight: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            flexShrink: 0,
            zIndex: 45,
            minHeight: "calc(100dvh - 52px)",
          }}
          className={[
            // Mobile: fixed, slide from left
            "fixed top-[52px] left-0 h-[calc(100dvh-52px)]",
            // Desktop: static, always visible
            "lg:static lg:h-auto lg:pointer-events-auto",
            // Slide animation
            sidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none lg:translate-x-0",
          ].join(" ")}
        >
          {/* Nav Links */}
          <nav style={{ flex: 1, padding: 16, overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    style={
                      active
                        ? {
                            background: "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(59,130,246,0.18))",
                            border: "1px solid rgba(6,182,212,0.35)",
                            color: "#67e8f9",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: 12,
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 14,
                          }
                        : {
                            color: isDark ? "#cbd5e1" : "#bfdbfe",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: 12,
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: 14,
                            border: "1px solid transparent",
                          }
                    }
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sign Out */}
          <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                color: "#fca5a5",
                background: "transparent",
                border: "none",
                width: "100%",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <LogOut style={{ width: 18, height: 18 }} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main style={{ flex: 1, background: bg, minHeight: "calc(100vh - 52px)", overflowX: "hidden" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px" }} className="lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
