import { AdminGuard } from "@/lib/admin-guard";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardClient />
    </AdminGuard>
  );
}
