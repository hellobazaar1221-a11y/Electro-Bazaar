import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const orders = await prisma.order.findMany({
    include: {
      items: { select: { id: true } },
      user: { select: { fullName: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const transformed = orders.map((o: any) => ({
    ...o,
    user: o.user ? { name: o.user.fullName, email: o.user.email } : null,
  }));
  return NextResponse.json({ orders: transformed });
}
