import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetail } from "./product-detail";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, reviews: { include: { user: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!product) return notFound();
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
  });
  return <ProductDetail product={JSON.parse(JSON.stringify(product))} related={JSON.parse(JSON.stringify(related))} />;
}
