"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/format";
import { useSession } from "next-auth/react";
import { getGuestCart, updateGuestCartQty, removeFromGuestCart } from "@/lib/cart-local";

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (status === "authenticated") {
        const res = await fetch("/api/cart");
        const d = res.ok ? await res.json() : [];
        setItems(Array.isArray(d) ? d : []);
      } else {
        const guestCart = getGuestCart();
        const res = await fetch("/api/products");
        const products = res.ok ? await res.json() : [];
        const mapped = guestCart.map(item => {
          const p = products.find((prod: any) => prod.id === item.productId);
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: p || null
          };
        }).filter(item => item.product !== null);
        setItems(mapped);
      }
    } catch {
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== undefined) {
      load();
    }
  }, [status]);

  const updateQty = async (id: string, q: number) => {
    if (q < 1) return;
    if (status === "authenticated") {
      const res = await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: id, quantity: q }) });
      if (res.ok) setItems(prev => prev.map(it => it.id === id ? { ...it, quantity: q } : it));
    } else {
      const item = items.find(it => it.id === id);
      if (item) {
        updateGuestCartQty(item.productId, q);
        setItems(prev => prev.map(it => it.id === id ? { ...it, quantity: q } : it));
      }
    }
  };

  const remove = async (id: string) => {
    if (status === "authenticated") {
      const res = await fetch(`/api/cart?itemId=${id}`, { method: "DELETE" });
      if (res.ok) { setItems(prev => prev.filter(it => it.id !== id)); toast.success("Removed from cart"); }
    } else {
      const item = items.find(it => it.id === id);
      if (item) {
        removeFromGuestCart(item.productId);
        setItems(prev => prev.filter(it => it.id !== id));
        toast.success("Removed from cart");
      }
    }
  };

  const subtotal = items.reduce((s: number, it: any) => s + (it.product?.price ?? 0) * it.quantity, 0);
  const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (loading) return <div className="mx-auto max-w-[1200px] px-4 py-12 text-center text-muted-foreground">Loading cart...</div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4"><ShoppingBag className="h-10 w-10 text-muted-foreground" /></div>
        <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse products and add your favorites</p>
        <Link href="/products"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-6">Shopping Cart ({items.length})</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((it: any) => (
              <motion.div key={it.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card rounded-xl p-4 product-card-shadow">
                <div className="flex gap-4">
                  <Link href={`/products/${it.product?.slug}`} className="relative h-24 w-24 shrink-0 bg-muted rounded-lg overflow-hidden">
                    <Image src={it.product?.image} alt={it.product?.name ?? ""} fill className="object-contain p-2" unoptimized />
                  </Link>
                  <div className="flex-1 min-w-0">
                    {it.product?.brand && <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{it.product.brand}</p>}
                    <Link href={`/products/${it.product?.slug}`}><h3 className="font-semibold text-sm line-clamp-1 hover:text-primary">{it.product?.name}</h3></Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{it.product?.category?.name}</p>
                    <div className="flex items-center justify-between mt-3 gap-3">
                      <div className="flex items-center border border-input rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(it.id, it.quantity - 1)} className="h-8 w-8 hover:bg-muted" aria-label="Decrease"><Minus className="h-3.5 w-3.5 mx-auto" /></button>
                        <span className="h-8 w-10 flex items-center justify-center text-sm font-medium">{it.quantity}</span>
                        <button onClick={() => updateQty(it.id, it.quantity + 1)} className="h-8 w-8 hover:bg-muted" aria-label="Increase"><Plus className="h-3.5 w-3.5 mx-auto" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold">{formatRupees((it.product?.price ?? 0) * it.quantity)}</p>
                        <p className="text-xs text-muted-foreground">{formatRupees(it.product?.price ?? 0)} each</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-card rounded-xl p-5 product-card-shadow h-fit lg:sticky lg:top-20">
          <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium">{formatRupees(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium">{shipping === 0 ? "Free" : formatRupees(shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax (18% GST)</dt><dd className="font-medium">{formatRupees(tax)}</dd></div>
            <div className="border-t border-border pt-2 mt-2"></div>
            <div className="flex justify-between text-base"><dt className="font-bold">Total</dt><dd className="font-display font-bold text-lg">{formatRupees(total)}</dd></div>
          </dl>
          <Button 
            onClick={() => {
              if (status === "authenticated") {
                router.push("/checkout");
              } else {
                router.push("/login?callbackUrl=/checkout");
              }
            }} 
            className="w-full mt-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 h-11"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">Secure checkout • Cash on Delivery available</p>
        </div>
      </div>
    </div>
  );
}
