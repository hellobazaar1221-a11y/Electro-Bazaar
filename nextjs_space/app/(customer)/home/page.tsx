import { prisma } from "@/lib/db";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, trending] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({ where: { featured: true, isActive: true }, take: 8, orderBy: { rating: "desc" } }),
    prisma.product.findMany({ where: { trending: true, isActive: true }, take: 8, orderBy: { reviewCount: "desc" } }),
  ]);
  return <HomeClient categories={JSON.parse(JSON.stringify(categories))} featured={JSON.parse(JSON.stringify(featured))} trending={JSON.parse(JSON.stringify(trending))} />;
}
