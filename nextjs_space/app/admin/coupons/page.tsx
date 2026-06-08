import { AdminGuard } from "@/lib/admin-guard";
import CouponsClient from "./coupons-client";

export const dynamic = "force-dynamic";

export default function AdminCouponsPage() {
  return (
    <AdminGuard>
      <CouponsClient />
    </AdminGuard>
  );
}
