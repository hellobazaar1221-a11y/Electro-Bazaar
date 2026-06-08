import { AdminGuard } from "@/lib/admin-guard";
import OrderDetailClient from "./order-detail-client";

export const dynamic = "force-dynamic";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminGuard>
      <OrderDetailClient orderId={params?.id ?? ""} />
    </AdminGuard>
  );
}
