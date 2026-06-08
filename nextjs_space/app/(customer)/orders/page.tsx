"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatRupees, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

export default function OrdersPage() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders").then(r => r.ok ? r.json() : []).then(d => setOrders(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated" || loading) return <div className="mx-auto max-w-[1200px] px-4 py-12 text-center text-muted-foreground">Loading orders...</div>;
  if (orders.length === 0) return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4"><Package className="h-10 w-10 text-muted-foreground" /></div>
      <h1 className="text-2xl font-display font-bold mb-2">No orders yet</h1>
      <p className="text-muted-foreground mb-6">Place your first order to see it here</p>
      <Link href="/products"><Button>Start Shopping</Button></Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-6">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o: any, i: number) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`/orders/${o.id}`} className="block bg-card rounded-xl p-4 product-card-shadow hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold truncate">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">Placed on {formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">{ORDER_STATUS_LABELS[o.status] ?? o.status}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-3">
                  {(o.items ?? []).slice(0, 4).map((it: any) => (
                    <div key={it.id} className="relative h-12 w-12 rounded-lg bg-muted border-2 border-card overflow-hidden">
                      <Image src={it.image} alt={it.name} fill className="object-contain p-1" unoptimized />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{o.items?.length ?? 0} item(s)</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-bold">{formatRupees(o.total)}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
