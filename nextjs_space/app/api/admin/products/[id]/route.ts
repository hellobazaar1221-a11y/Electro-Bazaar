import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const data = await req.json();
  const allowed: any = {};
  const fields = ["name", "description", "price", "originalPrice", "discount", "stock", "brand", "image", "images", "categoryId", "featured", "trending", "isActive", "specs"];
  for (const f of fields) {
    if (data[f] !== undefined) {
      if (["price", "originalPrice", "discount", "stock"].includes(f) && data[f] !== null) {
        allowed[f] = Number(data[f]);
      } else {
        allowed[f] = data[f];
      }
    }
  }
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Recalculate discount based on update
  if (allowed.price !== undefined || allowed.originalPrice !== undefined) {
    const finalPrice = allowed.price !== undefined ? allowed.price : Number(product.price || 0);
    const finalOriginalPrice = allowed.originalPrice !== undefined ? allowed.originalPrice : product.originalPrice;
    if (finalOriginalPrice && finalOriginalPrice > finalPrice) {
      allowed.discount = Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100);
    } else {
      allowed.discount = 0;
    }
  }

  const updatedProduct = await prisma.product.update({ where: { id: params.id }, data: allowed });
  return NextResponse.json(updatedProduct);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
