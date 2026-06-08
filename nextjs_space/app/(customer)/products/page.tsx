import { Suspense } from "react";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-[1200px] px-4 py-8">Loading products...</div>}><ProductsClient /></Suspense>;
}
