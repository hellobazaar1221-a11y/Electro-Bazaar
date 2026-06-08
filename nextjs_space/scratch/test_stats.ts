import { prisma } from "../lib/db";

async function testStats() {
  try {
    console.log("Fetching order count...");
    const totalOrdersRow = await prisma.order.count();
    console.log("Total orders:", totalOrdersRow);

    console.log("Aggregating revenue...");
    const totalRevenueRow = await prisma.order.aggregate({ _sum: { total: true } });
    console.log("Total revenue:", totalRevenueRow);

    console.log("Counting products...");
    const totalProducts = await prisma.product.count();
    console.log("Total products:", totalProducts);

    console.log("Counting customers...");
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    console.log("Total customers:", totalCustomers);

    console.log("Fetching recent orders...");
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { fullName: true } } },
    });
    console.log("Recent orders count:", recentOrders.length);

    console.log("Fetching 7 days orders...");
    const allOrders = await prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { total: true, createdAt: true },
    });
    console.log("7 days orders count:", allOrders.length);

    console.log("Fetching categories...");
    const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
    console.log("Categories count:", categories.length);

    // Daily revenue (last 7 days)
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      dailyMap[key] = 0;
    }
    for (const o of allOrders) {
      if (!o.createdAt) {
        console.warn("Found order without createdAt:", o);
        continue;
      }
      const dateObj = new Date(o.createdAt);
      const key = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (dailyMap[key] != null) dailyMap[key] += o.total;
    }
    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));
    console.log("Daily Revenue:", dailyRevenue);

    const stats = {
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
    };
    console.log("Stats calculated successfully:", JSON.stringify(stats, null, 2));
  } catch (err: any) {
    console.error("Test stats failed with error:", err);
  }
}

testStats().then(() => prisma.$disconnect());
