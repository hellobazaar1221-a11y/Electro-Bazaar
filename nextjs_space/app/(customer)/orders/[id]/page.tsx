"use client";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Circle, Package, MapPin, CreditCard, ShoppingBag, AlertTriangle, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatRupees, formatDateTime, ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/format";
import { useSession } from "next-auth/react";

export default function OrderDetailPage({ params }: { params: any }) {
  const id = (params?.then ? use(params) : params)?.id as string;
  const { status } = useSession() || {};
  const router = useRouter();
  const sp = useSearchParams();
  const justPlaced = sp?.get("just") === "1";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=/orders/${id}`);
    }
  }, [status, id, router]);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    fetch(`/api/orders/${id}`).then(r => r.ok ? r.json() : null).then(setOrder).finally(() => setLoading(false));
  }, [id, status]);

  const handleDownloadInvoice = () => {
    if (!order?.invoiceUrl) return;
    try {
      const url = order.invoiceUrl;
      const fileName = `invoice-${order.orderNumber || order.id}.pdf`;
      if (url.startsWith("data:")) {
        const parts = url.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "application/pdf";
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        fetch(url)
          .then(r => {
            if (!r.ok) throw new Error("Fetch failed");
            return r.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          })
          .catch(fetchErr => {
            console.warn("Fetch download failed, falling back to direct link:", fetchErr);
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      window.open(order.invoiceUrl, "_blank");
    }
  };

  if (status === "loading" || status === "unauthenticated" || loading) return <div className="mx-auto max-w-[1200px] px-4 py-12 text-center text-muted-foreground">Loading order...</div>;
  if (!order) return <div className="mx-auto max-w-[1200px] px-4 py-12 text-center text-muted-foreground">Order not found</div>;

  const currentIdx = ORDER_STATUSES.indexOf(order.status);
  const trackingMap = new Map<string, any>();
  for (const t of (order.tracking ?? [])) trackingMap.set(t.status, t);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      {justPlaced && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-5 mb-5 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2" />
          <h2 className="text-xl font-display font-bold">Order Placed Successfully!</h2>
          <p className="text-white/90 text-sm mt-1">Thank you for shopping with Electro Bazaar</p>
        </motion.div>
      )}

      <div className="flex items-end justify-between mb-6 gap-3">
        <div>
          <Link href="/orders" className="text-xs text-muted-foreground hover:text-foreground">← Back to orders</Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Order Details</h1>
          <p className="font-mono text-sm text-muted-foreground mt-1">{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          <section className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Order Tracking</h2>
            {order.status === "CANCELLED" ? (
              <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center font-bold text-sm flex items-center justify-center gap-2 animate-pulse">
                <AlertTriangle className="h-5 w-5" />
                This order has been cancelled.
              </div>
            ) : (
              <ol className="relative">
                {ORDER_STATUSES.map((s, idx) => {
                  const done = idx <= currentIdx;
                  const active = idx === currentIdx;
                  const t = trackingMap.get(s);
                  return (
                    <li key={s} className="flex items-start gap-3 pb-4 last:pb-0 relative">
                      {idx < ORDER_STATUSES.length - 1 && <div className={`absolute left-[11px] top-7 bottom-0 w-0.5 ${idx < currentIdx ? "bg-primary" : "bg-border"}`} />}
                      <div className={`shrink-0 z-10 ${done ? "text-primary" : "text-muted-foreground"}`}>
                        {done ? <CheckCircle2 className={`h-6 w-6 ${active ? "animate-pulse" : ""}`} /> : <Circle className="h-6 w-6" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{ORDER_STATUS_LABELS[s]}</p>
                        {t && <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" />Items</h2>
            <div className="divide-y divide-border">
              {(order.items ?? []).map((it: any) => (
                <div key={it.id} className="py-3 flex items-center gap-3">
                  <div className="relative h-14 w-14 bg-muted rounded-md overflow-hidden shrink-0">
                    <Image src={it.image} alt={it.name} fill className="object-contain p-1" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRupees(it.price)} × {it.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatRupees(it.price * it.quantity)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Shipping Address</h2>
            <div className="text-sm space-y-0.5">
              <p className="font-medium">{order.address?.fullName}</p>
              <p className="text-muted-foreground">{order.address?.phone}</p>
              <p>{order.address?.addressLine1}{order.address?.addressLine2 ? `, ${order.address.addressLine2}` : ""}</p>
              <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
            </div>
          </section>
          <section className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Payment</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{order.paymentMethod.replace("_", " ")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{order.paymentStatus}</span></div>
            </div>
          </section>
          <section className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-base mb-3">Order Total</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatRupees(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatRupees(order.shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatRupees(order.tax)}</dd></div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <dt className="flex items-center gap-1">Coupon ({order.couponCode})</dt>
                  <dd>−{formatRupees(order.couponDiscount)}</dd>
                </div>
              )}
              <div className="border-t border-border pt-1 mt-2"></div>
              <div className="flex justify-between font-bold text-base"><dt>Total</dt><dd className="font-display">{formatRupees(order.total)}</dd></div>
            </dl>
          </section>
          {order.invoiceUrl && (
            <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 product-card-shadow">
              <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Download className="h-4 w-4" /> Invoice Ready
              </h2>
              <p className="text-xs text-muted-foreground mb-3">Your invoice is ready. Click below to download it.</p>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer border-none outline-none"
              >
                <Download className="h-4 w-4" /> Download Invoice
              </button>
            </section>
          )}
          <Link href="/products" className="block w-full"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
        </div>
      </div>
    </div>
  );
}
