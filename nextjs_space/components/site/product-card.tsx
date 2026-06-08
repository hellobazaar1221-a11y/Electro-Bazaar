"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/format";
import { useSession } from "next-auth/react";
import { addToGuestCart } from "@/lib/cart-local";

export function ProductCard({ product, onAdd, onWish, inWishlist = false }: { product: any; onAdd?: (id: string) => void; onWish?: (id: string) => void; inWishlist?: boolean }) {
  const { status } = useSession() || {};
  const [imgErr, setImgErr] = useState(false);
  const [wishing, setWishing] = useState(inWishlist);
  const [adding, setAdding] = useState(false);

  const addToCart = async () => {
    if (adding) return;
    if (status !== "authenticated") {
      addToGuestCart(product.id, 1);
      toast.success("Added to cart");
      onAdd?.(product.id);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity: 1 }) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j?.error ?? "Failed to add to cart");
      } else {
        toast.success("Added to cart");
        onAdd?.(product.id);
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleWish = async () => {
    try {
      const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
      const data = await res.json();
      if (data?.added) { setWishing(true); toast.success("Added to wishlist"); }
      else if (data?.removed) { setWishing(false); toast.success("Removed from wishlist"); }
      onWish?.(product.id);
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="group bg-card rounded-xl overflow-hidden product-card-shadow hover:-translate-y-1 transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {!imgErr && product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" onError={() => setImgErr(true)} unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
          )}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">-{product.discount}%</div>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(); }}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition"
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 ${wishing ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-slate-300"}`} />
          </button>
        </div>
      </Link>
      <div className="p-3 space-y-2">
        {product.brand && <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{product.brand}</p>}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] hover:text-primary transition">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-xs">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium">{(product.rating ?? 0).toFixed(1)}</span>
          <span className="text-muted-foreground">({product.reviewCount ?? 0})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold">{formatRupees(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatRupees(product.originalPrice)}</span>
          )}
        </div>
        <Button onClick={addToCart} disabled={adding || product.stock === 0} size="sm" className="w-full mt-1">
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {product.stock === 0 ? "Out of stock" : adding ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </motion.div>
  );
}
