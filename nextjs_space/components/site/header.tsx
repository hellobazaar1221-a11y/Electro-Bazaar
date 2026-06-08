"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingCart, Heart, User, Menu, LogOut, Package, MapPin, HelpCircle, ChevronDown, Sun, Moon } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useTheme } from "next-themes";
import { getGuestCartCount } from "@/lib/cart-local";

type Category = { id: string; name: string; slug: string };

export function Header() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync next-themes with our legacy site-theme if present
    const saved = localStorage.getItem("site-theme");
    if (saved && (saved === "light" || saved === "dark")) {
      setTheme(saved);
    }
  }, [setTheme]);

  const isDark = mounted ? theme === "dark" : false;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("site-theme", newTheme);
  };

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => Array.isArray(d) ? setCategories(d) : null).catch(() => {});
  }, []);

  const updateCounts = () => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/cart").then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/wishlist").then(r => r.ok ? r.json() : []).catch(() => []),
      ]).then(([c, w]) => {
        setCartCount(Array.isArray(c) ? c.length : 0);
        setWishCount(Array.isArray(w) ? w.length : 0);
      });
    } else {
      setCartCount(getGuestCartCount());
      setWishCount(0);
    }
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener("guest-cart-change", updateCounts);
    return () => {
      window.removeEventListener("guest-cart-change", updateCounts);
    };
  }, [status, pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/offers", label: "Offers" },
    { href: "/support", label: "Support" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 backdrop-blur-xl border-b border-border dark:border-slate-700 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] dark:bg-slate-900">
                <div className="flex flex-col gap-6 mt-6">
                  <Logo />
                  <div className="flex flex-col gap-1">
                    {navLinks.map(l => (
                      <Link key={l.href} href={l.href} className="px-3 py-2 rounded-md hover:bg-muted text-sm font-medium dark:text-slate-200 dark:hover:bg-slate-800">{l.label}</Link>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-3">Categories</p>
                    <div className="flex flex-col gap-1">
                      {categories.map(c => (
                        <Link key={c.id} href={`/products?category=${c.slug}`} className="px-3 py-2 rounded-md hover:bg-muted text-sm dark:text-slate-200 dark:hover:bg-slate-800">{c.name}</Link>
                      ))}
                    </div>
                  </div>
                  {status === "authenticated" ? (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-3">Account</p>
                      <div className="flex flex-col gap-1">
                        <Link href="/profile" className="px-3 py-2 rounded-md hover:bg-muted text-sm font-medium dark:text-slate-200 dark:hover:bg-slate-800 flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" /> Profile
                        </Link>
                        <Link href="/orders" className="px-3 py-2 rounded-md hover:bg-muted text-sm font-medium dark:text-slate-200 dark:hover:bg-slate-800 flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" /> My Orders
                        </Link>
                        <Link href="/profile/addresses" className="px-3 py-2 rounded-md hover:bg-muted text-sm font-medium dark:text-slate-200 dark:hover:bg-slate-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" /> Addresses
                        </Link>
                        <Link href="/support" className="px-3 py-2 rounded-md hover:bg-muted text-sm font-medium dark:text-slate-200 dark:hover:bg-slate-800 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" /> Support
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/login" })}
                          className="w-full px-3 py-2 rounded-md hover:bg-red-500/10 text-red-500 text-left text-sm font-medium flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3">
                      <Button onClick={() => router.push("/login")} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold">
                        Login
                      </Button>
                    </div>
                  )}
                  {/* Theme toggle in mobile menu */}
                  <div className="px-3">
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                      style={{
                        background: isDark ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #1e293b, #334155)",
                        color: isDark ? "#1e293b" : "#fbbf24",
                        border: "2px solid " + (isDark ? "#fbbf24" : "#475569"),
                      }}
                    >
                      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Logo />

          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className={`px-3 py-2 rounded-md text-sm font-medium transition ${pathname === l.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"}`}>{l.label}</Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">
                  Categories <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                {categories.map(c => (
                  <DropdownMenuItem key={c.id} onClick={() => router.push(`/products?category=${c.slug}`)} className="dark:text-slate-200 dark:hover:bg-slate-700">{c.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <form onSubmit={handleSearch} className="flex-1 hidden md:block max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search electronics..." className="pl-10 bg-muted/50 border-transparent focus:border-input dark:bg-slate-800 dark:text-white dark:placeholder-slate-400" />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto md:ml-0">

            {/* ===== THEME TOGGLE BUTTON - VISIBLE ON ALL SCREENS ===== */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #1e293b, #334155)",
                color: isDark ? "#1e293b" : "#fbbf24",
                boxShadow: isDark
                  ? "0 0 12px rgba(251,191,36,0.5)"
                  : "0 0 12px rgba(30,41,59,0.4)",
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Button variant="ghost" size="icon" aria-label="Wishlist" onClick={() => router.push("/wishlist")} className="relative dark:text-slate-200 dark:hover:bg-slate-800">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{wishCount}</span>}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cart" onClick={() => router.push("/cart")} className="relative dark:text-slate-200 dark:hover:bg-slate-800">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
            </Button>
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Profile" className="dark:text-slate-200 dark:hover:bg-slate-800"><User className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                  <div className="px-2 py-1.5 text-sm font-semibold dark:text-white">{session?.user?.name ?? "Account"}</div>
                  <div className="px-2 pb-2 text-xs text-muted-foreground truncate">{session?.user?.email}</div>
                  <DropdownMenuSeparator className="dark:border-slate-700" />
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="dark:text-slate-200 dark:hover:bg-slate-700"><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")} className="dark:text-slate-200 dark:hover:bg-slate-700"><Package className="mr-2 h-4 w-4" />My Orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile/addresses")} className="dark:text-slate-200 dark:hover:bg-slate-700"><MapPin className="mr-2 h-4 w-4" />Addresses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/support")} className="dark:text-slate-200 dark:hover:bg-slate-700"><HelpCircle className="mr-2 h-4 w-4" />Support</DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:border-slate-700" />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="dark:text-slate-200 dark:hover:bg-slate-700"><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                size="sm"
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition shadow-md hover:shadow-sky-500/25"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search electronics..." className="pl-10 bg-muted/50 border-transparent dark:bg-slate-800 dark:text-white dark:placeholder-slate-400" />
          </div>
        </form>
      </div>
    </header>
  );
}
