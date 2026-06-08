import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const data = await req.json();
  const allowed: any = {};
  for (const f of ["name", "description", "image", "icon"]) {
    if (data[f] !== undefined) allowed[f] = data[f];
  }
  const cat = await prisma.category.update({ where: { id: params.id }, data: allowed });
  return NextResponse.json(cat);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const count = await prisma.product.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return NextResponse.json({ error: `Cannot delete: ${count} product(s) in this category` }, { status: 400 });
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
