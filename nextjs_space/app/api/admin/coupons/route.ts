import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const data = await req.json();
  const { code, type, value, minOrder, maxUses, expiresAt, description, isActive } = data ?? {};

  if (!code || !type || value == null || !expiresAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.coupon.findFirst({ where: { code: code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder ?? 0),
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      expiresAt,
      assignedUserIds: [],
      isActive: isActive !== false,
      description: description ?? null,
    },
  });
  return NextResponse.json(coupon);
}
