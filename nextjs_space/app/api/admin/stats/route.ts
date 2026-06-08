import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [totalOrdersRow, totalRevenueRow, totalProducts, totalCustomers, recentOrders, allOrders, categories] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { fullName: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { total: true, createdAt: true },
    }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
  ]);

  // Daily revenue (last 7 days)
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    dailyMap[key] = 0;
  }
  for (const o of allOrders) {
    const dateObj = new Date(o.createdAt);
    const key = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    if (dailyMap[key] != null) dailyMap[key] += o.total;
  }
  const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

  return NextResponse.json({
    totalRevenue: totalRevenueRow._sum.total ?? 0,
    totalOrders: totalOrdersRow,
    totalProducts,
    totalCustomers,
    recentOrders: recentOrders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      user: { name: o.user?.fullName ?? "-" },
    })),
    dailyRevenue,
    categoryStats: categories.map((c: any) => ({ name: c.name, count: c._count?.products ?? 0 })),
    topProducts: [],
  });
}
