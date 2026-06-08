"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Sparkles, Flame, TrendingUp, Smartphone, Laptop, Tv, Watch, Refrigerator } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = { Smartphone, Laptop, Tv, Headphones, Watch, Refrigerator };

export function HomeClient({ categories, featured, trending }: { categories: any[]; featured: any[]; trending: any[] }) {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="absolute inset-0 opacity-30">
          <Image src="https://cdn.abacus.ai/images/be31ebdc-6aee-4d3b-ba94-052316abb186.png" alt="Electronics" fill className="object-cover" unoptimized />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20">
              <Sparkles className="h-3 w-3" /> Premium Electronics, Authentic Brands
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4">
              Tech that <span className="text-gradient bg-gradient-to-r from-cyan-300 to-violet-300">moves</span> you forward.
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-6 max-w-xl">Shop the latest smartphones, laptops, TVs, and audio gear at unbeatable prices across India.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products"><Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 shadow-xl">Shop Now <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
              <Link href="/offers"><Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">View Offers</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-[1200px] px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, t: "Free Shipping", s: "On orders over \u20B910,000" },
            { icon: ShieldCheck, t: "Authentic Products", s: "100% genuine guarantee" },
            { icon: RotateCcw, t: "Easy Returns", s: "7-day return policy" },
            { icon: Headphones, t: "24/7 Support", s: "Always here to help" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><f.icon className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{f.t}</p>
                <p className="text-xs text-muted-foreground truncate">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground text-sm mt-1">Explore our wide range of electronics</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c: any, i: number) => {
            const Icon = iconMap[c.icon] ?? Smartphone;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                <Link href={`/products?category=${c.slug}`} className="group block bg-card rounded-xl p-4 text-center product-card-shadow hover:-translate-y-1 transition-all">
                  <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-950/50 dark:to-blue-950/50 flex items-center justify-center text-primary dark:text-sky-400 mb-3 group-hover:scale-110 transition">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c._count?.products ?? 0} items</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 py-8">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /><h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Featured Products</h2></div>
            <Link href="/products?featured=true" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white p-8 md:p-12">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-3"><Flame className="h-3 w-3" /> MEGA SALE</div>
            <h3 className="text-2xl md:text-4xl font-display font-bold mb-2">Up to 70% Off on Audio</h3>
            <p className="text-white/90 mb-5">Premium headphones, earbuds and speakers from your favorite brands.</p>
            <Link href="/products?category=audio"><Button className="bg-white text-blue-700 hover:bg-white/90">Shop Audio <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          </div>
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        </motion.div>
      </section>

      {trending.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 py-8">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-rose-500" /><h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Trending Now</h2></div>
            <Link href="/products?trending=true" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
