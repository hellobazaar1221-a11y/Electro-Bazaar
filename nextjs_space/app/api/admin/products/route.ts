import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const data = await req.json();
  const { name, slug: providedSlug, description, price, originalPrice, stock, brand, image, images, categoryId, featured } = data ?? {};
  if (!name || !description || price == null || !image || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  let slug = providedSlug ? slugify(providedSlug) : slugify(name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = slug + "-" + Date.now().toString(36);
  const numPrice = Number(price);
  const numOriginalPrice = originalPrice != null ? Number(originalPrice) : null;
  let computedDiscount = 0;
  if (numOriginalPrice && numOriginalPrice > numPrice) {
    computedDiscount = Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100);
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: numPrice,
      originalPrice: numOriginalPrice,
      discount: computedDiscount,
      stock: Number(stock ?? 0),
      brand: brand ?? null,
      image,
      images: Array.isArray(images) ? images : [image],
      categoryId,
      featured: !!featured,
    },
  });
  return NextResponse.json(product);
}
