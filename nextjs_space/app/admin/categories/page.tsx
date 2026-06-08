import { AdminGuard } from "@/lib/admin-guard";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <CategoriesClient />
    </AdminGuard>
  );
}
