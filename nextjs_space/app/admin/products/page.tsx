import { AdminGuard } from "@/lib/admin-guard";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <ProductsClient />
    </AdminGuard>
  );
}
