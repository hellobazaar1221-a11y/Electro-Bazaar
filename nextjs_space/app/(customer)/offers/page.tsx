import { prisma } from "@/lib/db";
import { OffersClient } from "./offers-client";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const products = await prisma.product.findMany({
    where: { discount: { gt: 0 }, isActive: true },
    orderBy: { discount: "desc" },
    take: 24,
  });

  const allCoupons = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { expiresAt: "asc" }
  });

  const now = new Date();
  const coupons = allCoupons.filter((c: any) => new Date(c.expiresAt) > now);

  return (
    <OffersClient 
      products={JSON.parse(JSON.stringify(products))} 
      coupons={JSON.parse(JSON.stringify(coupons))}
    />
  );
}

