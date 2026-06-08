"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, Minus, Plus, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { formatRupees } from "@/lib/format";
import { useSession } from "next-auth/react";
import { addToGuestCart } from "@/lib/cart-local";

export function ProductDetail({ product, related }: { product: any; related: any[] }) {
  const { status } = useSession() || {};
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishing, setWishing] = useState(false);
  const [inWish, setInWish] = useState(false);

  useEffect(() => {
    fetch("/api/wishlist").then(r => r.ok ? r.json() : []).then(d => {
      if (Array.isArray(d)) setInWish(d.some((w: any) => w.productId === product.id));
    }).catch(() => {});
  }, [product.id]);

  const add = async () => {
    if (status !== "authenticated") {
      addToGuestCart(product.id, qty);
      toast.success("Added to cart");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity: qty }) });
      if (res.ok) toast.success("Added to cart"); else toast.error("Failed to add to cart");
    } finally { setAdding(false); }
  };
  const buyNow = async () => {
    if (status !== "authenticated") {
      addToGuestCart(product.id, qty);
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    await add();
    router.push("/checkout");
  };
  const toggleWish = async () => {
    if (wishing) return; setWishing(true);
    try {
      const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
      const data = await res.json();
      if (data?.added) { setInWish(true); toast.success("Added to wishlist"); }
      else if (data?.removed) { setInWish(false); toast.success("Removed from wishlist"); }
    } finally { setWishing(false); }
  };

  const [activeImage, setActiveImage] = useState(product.image);

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  const specs = (product.specs ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1 flex-wrap">
        <Link href="/home" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-foreground">{product.category?.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-muted rounded-2xl aspect-square relative overflow-hidden">
            <Image src={activeImage || product.image} alt={product.name} fill className="object-contain p-8" unoptimized />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  type="button"
                  className={`relative w-20 h-20 rounded-xl bg-muted border-2 overflow-hidden flex-shrink-0 transition-all ${
                    activeImage === img ? "border-sky-500 scale-95" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {product.brand && <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{product.brand}</p>}
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}</div>
            <span className="text-sm font-medium">{(product.rating ?? 0).toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-3xl md:text-4xl font-display font-bold">{formatRupees(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (<>
              <span className="text-lg text-muted-foreground line-through">{formatRupees(product.originalPrice)}</span>
              <span className="text-sm font-bold text-emerald-600">{product.discount}% off</span>
            </>)}
          </div>
          <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
          <p className="text-sm leading-relaxed text-foreground/80 pt-2">{product.description}</p>

          {product.stock === 0 ? (
            <p className="text-sm text-red-600 font-medium">Out of Stock</p>
          ) : product.stock === 1 ? (
            <p className="text-sm text-amber-600 font-medium">1 Last Pic. Available!</p>
          ) : (
            <p className="text-sm text-emerald-600 font-medium">✓ In Stock</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-input rounded-lg overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 hover:bg-muted" aria-label="Decrease"><Minus className="h-4 w-4 mx-auto" /></button>
              <span className="h-10 w-10 flex items-center justify-center font-medium text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="h-10 w-10 hover:bg-muted" aria-label="Increase"><Plus className="h-4 w-4 mx-auto" /></button>
            </div>
            <Button size="icon" variant="outline" onClick={toggleWish} aria-label="Wishlist" className="h-10 w-10"><Heart className={`h-4 w-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} /></Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={add} disabled={adding || product.stock === 0} size="lg" variant="outline" className="flex-1"><ShoppingCart className="h-4 w-4 mr-2" />{adding ? "Adding..." : "Add to Cart"}</Button>
            <Button onClick={buyNow} disabled={product.stock === 0} size="lg" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">Buy Now</Button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3">
            {[{icon: Truck, t: "Free Shipping"}, {icon: ShieldCheck, t: "Authentic"}, {icon: RotateCcw, t: "7-day Returns"}].map(({icon: I, t}, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg"><I className="h-4 w-4 mx-auto mb-1" />{t}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {Object.keys(specs).length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-display font-bold mb-4 tracking-tight">Specifications</h2>
          <div className="bg-card rounded-xl product-card-shadow overflow-hidden">
            <dl className="divide-y divide-border">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 px-4 py-3 text-sm">
                  <dt className="text-muted-foreground col-span-1">{k}</dt>
                  <dd className="col-span-2 font-medium">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-display font-bold mb-5 tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{related.map((p: any) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
