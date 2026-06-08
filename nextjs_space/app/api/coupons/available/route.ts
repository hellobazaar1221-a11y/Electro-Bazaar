import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const allCoupons = await prisma.coupon.findMany({ where: { isActive: true }, orderBy: { expiresAt: "asc" } });
  const now = new Date();
  const available = allCoupons.filter((c: any) => new Date(c.expiresAt) > now);
  return NextResponse.json({ coupons: available });
}
