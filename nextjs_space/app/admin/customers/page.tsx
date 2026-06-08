import { AdminGuard } from "@/lib/admin-guard";
import CustomersClient from "./customers-client";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  return (
    <AdminGuard>
      <CustomersClient />
    </AdminGuard>
  );
}
