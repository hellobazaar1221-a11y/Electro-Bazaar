import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminLayout } from "@/components/admin/admin-layout";

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }
  return <AdminLayout>{children}</AdminLayout>;
}
