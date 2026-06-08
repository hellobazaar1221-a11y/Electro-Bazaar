"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Filter, X, SlidersHorizontal, Search } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function ProductsClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");

  const category = params?.get("category") ?? "";
  const search = params?.get("search") ?? "";
  const featured = params?.get("featured") ?? "";
  const trending = params?.get("trending") ?? "";

  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (search) sp.set("search", search);
    if (featured) sp.set("featured", featured);
    if (trending) sp.set("trending", trending);
    if (sort) sp.set("sort", sort);
    if (maxPriceFilter) sp.set("maxPrice", maxPriceFilter);
    fetch(`/api/products?${sp.toString()}`).then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [category, search, featured, trending, sort, maxPriceFilter]);

  const setFilter = (key: string, value: string) => {
    const sp = new URLSearchParams(params?.toString() ?? "");
    if (value) sp.set(key, value); else sp.delete(key);
    router.push(`/products?${sp.toString()}`);
  };

  const clearFilters = () => router.push("/products");
  const currentCat = categories.find((c: any) => c.slug === category);
  const title = search ? `Results for "${search}"` : currentCat ? currentCat.name : featured ? "Featured Products" : trending ? "Trending Products" : "All Products";

  const FiltersBody = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">Category</h4>
        <div className="flex flex-col gap-1">
          <button onClick={() => setFilter("category", "")} className={`text-left px-3 py-1.5 rounded-md text-sm transition ${!category ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>All</button>
          {categories.map((c: any) => (
            <button key={c.id} onClick={() => setFilter("category", c.slug)} className={`text-left px-3 py-1.5 rounded-md text-sm transition ${category === c.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>{c.name}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">Max Price</h4>
        <div className="flex flex-col gap-1">
          {["", "10000", "30000", "60000", "100000", "200000"].map(v => (
            <button key={v || "all"} onClick={() => setMaxPriceFilter(v)} className={`text-left px-3 py-1.5 rounded-md text-sm ${maxPriceFilter === v ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
              {v ? `Up to \u20B9${Number(v).toLocaleString("en-IN")}` : "Any"}
            </button>
          ))}
        </div>
      </div>
      <Button variant="outline" onClick={clearFilters} className="w-full"><X className="h-4 w-4 mr-2" />Clear filters</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <div className="flex items-end justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{loading ? "Loading..." : `${products.length} ${products.length === 1 ? "product" : "products"}`}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="icon" aria-label="Filters"><SlidersHorizontal className="h-4 w-4" /></Button></SheetTrigger>
              <SheetContent side="left"><div className="mt-6"><FiltersBody /></div></SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="hidden lg:block sticky top-20 h-fit bg-card rounded-xl p-5 product-card-shadow">
          <div className="flex items-center gap-2 mb-4"><Filter className="h-4 w-4" /><h3 className="font-display font-bold">Filters</h3></div>
          <FiltersBody />
        </aside>
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-display text-lg font-semibold">No products found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
