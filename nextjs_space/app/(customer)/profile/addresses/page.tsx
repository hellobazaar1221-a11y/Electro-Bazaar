"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AddressesPage() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", isDefault: false });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/profile/addresses");
    }
  }, [status, router]);

  const load = () => {
    if (status !== "authenticated") return;
    fetch("/api/addresses").then(r => r.ok ? r.json() : []).then(d => setAddresses(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(form.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }
    if (!/^[0-9]{10}$/.test(form.phone)) { toast.error("Enter a valid 10-digit phone"); return; }
    const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShow(false); setForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", isDefault: false }); load(); toast.success("Address saved"); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    if (res.ok) { load(); toast.success("Address deleted"); }
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">My Addresses</h1>
        <Button onClick={() => setShow(!show)}><Plus className="h-4 w-4 mr-1" />Add Address</Button>
      </div>
      {show && (
        <form onSubmit={save} className="bg-card rounded-xl p-5 product-card-shadow mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <input required placeholder="Phone (10 digits)" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9]/g, "")})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <input required placeholder="Address Line 1" value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <input placeholder="Address Line 2" value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <input required placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <input required placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <input required placeholder="Pincode" maxLength={6} value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/[^0-9]/g, "")})} className="h-10 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="h-4 w-4 accent-primary" />Set as default</label>
          <Button type="submit" className="sm:col-span-2">Save Address</Button>
        </form>
      )}
      {loading ? <div className="text-center text-muted-foreground py-12">Loading...</div> :
        addresses.length === 0 ? (
          <div className="text-center py-16"><MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" /><p className="text-muted-foreground">No addresses saved yet</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {addresses.map((a: any) => (
              <div key={a.id} className="bg-card rounded-xl p-4 product-card-shadow relative">
                {a.isDefault && <span className="absolute top-3 right-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">DEFAULT</span>}
                <p className="font-semibold text-sm pr-16">{a.fullName}</p>
                <p className="text-xs text-muted-foreground">{a.phone}</p>
                <p className="text-sm mt-2">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</p>
                <p className="text-sm text-muted-foreground">{a.city}, {a.state} - {a.pincode}</p>
                <Button variant="ghost" size="sm" onClick={() => remove(a.id)} className="mt-2 text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
