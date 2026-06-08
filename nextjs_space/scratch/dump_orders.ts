import { prisma } from "../lib/db";

async function dump() {
  try {
    const orders = await prisma.order.findMany();
    console.log("Orders count:", orders.length);
    console.log("Orders:", JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error("Failed to dump orders:", e);
  }
}

dump().then(() => prisma.$disconnect());
