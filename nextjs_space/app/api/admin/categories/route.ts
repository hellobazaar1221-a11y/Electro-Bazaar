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
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { name, description, image, icon, slug: providedSlug } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  let slug = providedSlug ? slugify(providedSlug) : slugify(name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) slug = slug + "-" + Date.now().toString(36);
  const cat = await prisma.category.create({
    data: { name, slug, description: description ?? null, image: image ?? null, icon: icon ?? null },
  });
  return NextResponse.json(cat);
}
