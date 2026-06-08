"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/wishlist");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/wishlist").then(r => r.ok ? r.json() : []).then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated" || loading) return <div className="mx-auto max-w-[1200px] px-4 py-12 text-center text-muted-foreground">Loading wishlist...</div>;
  if (items.length === 0) return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4"><Heart className="h-10 w-10 text-muted-foreground" /></div>
      <h1 className="text-2xl font-display font-bold mb-2">Your wishlist is empty</h1>
      <p className="text-muted-foreground mb-6">Add products you love to keep them safe</p>
      <Link href="/products"><Button>Browse Products</Button></Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it: any) => <ProductCard key={it.id} product={it.product} inWishlist />)}
      </div>
    </div>
  );
}
