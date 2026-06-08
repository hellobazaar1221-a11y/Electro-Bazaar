import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CustomerLayout } from "@/components/site/customer-layout";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session && (session.user as any)?.role === "ADMIN") {
    redirect("/admin");
  }
  return <CustomerLayout>{children}</CustomerLayout>;
}
