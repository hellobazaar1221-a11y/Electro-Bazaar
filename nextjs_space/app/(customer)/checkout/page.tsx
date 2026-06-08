"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, CreditCard, Truck, Smartphone, Banknote, Loader2, Plus, CheckCircle2, Tag, X, Percent, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/format";
import { useSession } from "next-auth/react";
import { getGuestCart, clearGuestCart } from "@/lib/cart-local";

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: Banknote, working: true },
  { id: "UPI", label: "UPI Payment", desc: "Google Pay, PhonePe, Paytm", icon: Smartphone, working: false },
  { id: "CREDIT_CARD", label: "Credit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard, working: false },
  { id: "DEBIT_CARD", label: "Debit Card", desc: "All major banks", icon: CreditCard, working: false },
  { id: "NET_BANKING", label: "Net Banking", desc: "All major Indian banks", icon: Banknote, working: false },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const [syncing, setSyncing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Load addresses and cart + Sync guest cart if exists
  useEffect(() => {
    if (status !== "authenticated") return;

    const performSyncAndLoad = async () => {
      const guestCart = getGuestCart();
      const hasGuestItems = guestCart.length > 0;
      if (hasGuestItems) {
        setSyncing(true);
      } else {
        setLoadingData(true);
      }
      try {
        if (hasGuestItems) {
          // Sync guest cart to server cart sequentially
          for (const item of guestCart) {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
            });
          }
          clearGuestCart();
          toast.success("Guest cart synchronized successfully!");
        }

        const [a, c] = await Promise.all([
          fetch("/api/addresses").then(r => r.ok ? r.json() : []),
          fetch("/api/cart").then(r => r.ok ? r.json() : []),
        ]);

        setAddresses(Array.isArray(a) ? a : []);
        setCart(Array.isArray(c) ? c : []);
        if (Array.isArray(a) && a.length > 0) {
          const def = a.find((x: any) => x.isDefault) ?? a[0];
          setSelectedAddress(def.id);
        } else {
          setShowAddrForm(true);
        }
      } catch (err) {
        toast.error("Failed to load checkout data");
      } finally {
        setSyncing(false);
        setLoadingData(false);
      }
    };

    performSyncAndLoad();
  }, [status]);

  const subtotal = cart.reduce((s, it) => s + (it.product?.price ?? 0) * it.quantity, 0);
  const shipping = 0;
  const tax = 0;
  const total = Math.max(0, subtotal + shipping + tax - couponDiscount);

  const applyCoupon = async () => {
    if (!couponInput.trim()) { toast.error("Enter a coupon code"); return; }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Invalid coupon"); return; }
      setAppliedCoupon(data.coupon);
      setCouponDiscount(data.discount);
      toast.success(`Coupon applied! You save ${formatRupees(data.discount)}`);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(form.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }
    if (!/^[0-9]{10}$/.test(form.phone)) { toast.error("Enter a valid 10-digit phone number"); return; }
    const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, isDefault: true }) });
    if (!res.ok) { toast.error("Failed to save address"); return; }
    const newAddr = await res.json();
    setAddresses([newAddr, ...addresses]);
    setSelectedAddress(newAddr.id);
    setShowAddrForm(false);
    toast.success("Address saved");
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error("Please select an address"); return; }
    if (cart.length === 0) { toast.error("Your cart is empty"); return; }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          couponCode: appliedCoupon?.code ?? null,
          couponDiscount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Failed to place order"); return; }
      toast.success("Order placed successfully!");
      router.replace(`/orders/${data.id}?just=1`);
    } finally { setPlacing(false); }
  };

  if (status === "loading" || status === "unauthenticated" || syncing || loadingData) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-20 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold">
          {syncing ? "Syncing your guest cart..." : "Loading checkout page..."}
        </p>
      </div>
    );
  }

  if (cart.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {/* Address */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-5 product-card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Shipping Address</h2>
              {addresses.length > 0 && <Button variant="ghost" size="sm" onClick={() => setShowAddrForm(!showAddrForm)}><Plus className="h-4 w-4 mr-1" /> New</Button>}
            </div>
            {addresses.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {addresses.map((a: any) => (
                  <label key={a.id} className={`block cursor-pointer rounded-lg p-3 border-2 transition ${selectedAddress === a.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <input type="radio" className="sr-only" name="addr" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} />
                    <p className="font-semibold text-sm">{a.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.phone}</p>
                    <p className="text-xs mt-1">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</p>
                    <p className="text-xs">{a.city}, {a.state} - {a.pincode}</p>
                  </label>
                ))}
              </div>
            )}
            {showAddrForm && (
              <form onSubmit={saveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border mt-2">
                <input required placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <input required placeholder="Phone (10 digits)" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9]/g, "")})} className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <input required placeholder="Address Line 1" value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-sm sm:col-span-2" />
                <input placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-sm sm:col-span-2" />
                <input required placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <input required placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <input required placeholder="Pincode (6 digits)" maxLength={6} value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/[^0-9]/g, "")})} className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <Button type="submit" className="sm:col-span-2">Save Address</Button>
              </form>
            )}
          </motion.section>

          {/* Coupon Section */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Apply Coupon</h2>
            {appliedCoupon ? (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                  {appliedCoupon.type === "PERCENT" ? <Percent className="h-5 w-5 text-emerald-600" /> : <IndianRupee className="h-5 w-5 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tracking-widest">{appliedCoupon.code}</span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">Applied ✓</span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    You save <span className="font-bold">{formatRupees(couponDiscount)}</span>
                    {appliedCoupon.description && <span className="text-muted-foreground ml-1">· {appliedCoupon.description}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expires: {appliedCoupon.expiresAt && !isNaN(new Date(appliedCoupon.expiresAt).getTime()) ? new Date(appliedCoupon.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive transition shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  placeholder="Enter coupon code"
                  className="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Button onClick={applyCoupon} disabled={couponLoading} className="h-11 px-5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                  {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}
          </motion.section>

          {/* Payment */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition ${paymentMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <input type="radio" name="pm" className="sr-only" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><m.icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{m.label} {m.working && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Active</span>}{!m.working && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {paymentMethod === m.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </label>
              ))}
            </div>
            {paymentMethod !== "COD" && <p className="text-xs text-amber-600 mt-3">Note: For this preview, only Cash on Delivery is processed.</p>}
          </motion.section>

          {/* Items */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-5 product-card-shadow">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Items ({cart.length})</h2>
            <div className="space-y-3">
              {cart.map((it: any) => (
                <div key={it.id} className="flex items-center gap-3 text-sm">
                  <div className="relative h-14 w-14 bg-muted rounded-md overflow-hidden shrink-0">
                    <Image src={it.product?.image} alt={it.product?.name ?? ""} fill className="object-contain p-1" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{it.product?.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatRupees((it.product?.price ?? 0) * it.quantity)}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl p-5 product-card-shadow h-fit lg:sticky lg:top-20">
          <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatRupees(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatRupees(shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax (18% GST)</dt><dd>{formatRupees(tax)}</dd></div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Coupon ({appliedCoupon?.code})</dt>
                <dd className="font-medium">−{formatRupees(couponDiscount)}</dd>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2"></div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd className="font-display text-lg">{formatRupees(total)}</dd>
            </div>
            {couponDiscount > 0 && (
              <div className="text-center text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/30 rounded-lg py-1.5">
                🎉 You're saving {formatRupees(couponDiscount)} with this coupon!
              </div>
            )}
          </dl>
          <Button onClick={placeOrder} disabled={placing || !selectedAddress} className="w-full mt-5 h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
            {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : `Place Order • ${formatRupees(total)}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">By placing this order you agree to our terms</p>
        </div>
      </div>
    </div>
  );
}
