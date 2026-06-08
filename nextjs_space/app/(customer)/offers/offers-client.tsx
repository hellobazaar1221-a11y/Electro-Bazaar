"use client";
import { useState } from "react";
import { Flame, Percent, Ticket, Copy, Check, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/site/product-card";
import { formatRupees } from "@/lib/format";
import { toast } from "sonner";

export function OffersClient({ products, coupons = [] }: { products: any[]; coupons?: any[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-4"
          >
            <Flame className="h-4 w-4" /> EXCLUSIVE DEALS
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Offers & Coupons</h1>
          <p className="text-white/95 mt-2 max-w-xl mx-auto">
            Claim exclusive discount coupons and browse special deals on Electro Bazaar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-12">
        {/* Coupons Section */}
        {coupons.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Ticket className="h-6 w-6 text-violet-500" />
              <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">Active Promo Coupons</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c: any) => {
                const discountText = c.type === "PERCENT" ? `${c.value}% OFF` : `${formatRupees(c.value)} OFF`;
                const minOrderText = c.minOrder > 0 ? `Min. Order: ${formatRupees(c.minOrder)}` : "No Min. Order Required";
                
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-card hover:bg-card/90 border border-violet-500/20 hover:border-violet-500/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Top Section */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300">
                          <Ticket className="h-3 w-3" /> Coupon Code
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {minOrderText}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-display font-extrabold text-violet-600 dark:text-violet-400">
                          {discountText}
                        </h3>
                        {c.description && (
                          <p className="text-sm text-foreground/80 font-medium">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Code & Expiry Section */}
                    <div className="px-5 pb-5 pt-3 bg-muted/40 border-t border-dashed border-border/80 space-y-3">
                      {/* Code block with copy button */}
                      <div className="flex items-center justify-between gap-2 bg-background border border-input rounded-xl p-2 font-mono">
                        <span className="pl-2 font-bold tracking-widest text-foreground text-sm">
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(c.code, c.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            copiedId === c.id
                              ? "bg-emerald-500 text-white"
                              : "bg-primary text-primary-foreground hover:bg-primary/95"
                          }`}
                        >
                          {copiedId === c.id ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>

                      {/* Expiration date as closing date */}
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Closing Date: {formatDate(c.expiresAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Percent className="h-6 w-6 text-rose-500" />
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">Best Deals Live Now ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
              No active product deals right now. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
