import { AdminGuard } from "@/lib/admin-guard";
import OrdersClient from "./orders-client";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <OrdersClient />
    </AdminGuard>
  );
}
