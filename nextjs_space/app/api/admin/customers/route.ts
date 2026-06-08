import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      createdAt: true,
      status: true,
      suspendReason: true,
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const list = customers.map((c: any) => ({
    id: c.id,
    email: c.email,
    name: c.fullName,
    phone: c.phone,
    createdAt: c.createdAt,
    status: c.status ?? "ACTIVE",
    suspendReason: c.suspendReason ?? "",
    _count: { orders: c._count?.orders ?? 0 },
    totalSpent: c.orders?.reduce?.((s: number, o: any) => s + (o?.total ?? 0), 0) ?? 0,
  }));
  return NextResponse.json({ customers: list });
}
