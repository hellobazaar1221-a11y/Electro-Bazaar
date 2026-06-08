"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Heart, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/products", icon: Grid3x3, label: "Shop" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  // Listen to theme changes in real time
  useEffect(() => {
    const checkDark = () => {
      const dark = document.documentElement.classList.contains("dark") || localStorage.getItem("site-theme") === "dark";
      setIsDark(dark);
    };

    // Check on mount
    checkDark();

    // Watch for class changes on <html>
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t transition-colors duration-300"
      style={{
        background: isDark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)",
        borderColor: isDark ? "#334155" : "#e2e8f0",
      }}
    >
      <div className="grid grid-cols-5 max-w-[1200px] mx-auto">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/home" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center py-2 gap-0.5 transition no-tap-highlight"
              style={{
                color: active
                  ? "#0ea5e9"
                  : isDark
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
