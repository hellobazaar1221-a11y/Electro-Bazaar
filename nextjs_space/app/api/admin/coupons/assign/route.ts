import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const data = await req.json();
  const { couponId, userId } = data ?? {};
  if (!couponId || !userId) {
    return NextResponse.json({ error: "Missing couponId or userId" }, { status: 400 });
  }
  // Fetch coupon
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  // Update assignedUserIds array
  const updated = await prisma.coupon.update({
    where: { id: couponId },
    data: {
      // @ts-ignore - using mock DB, push to array
      assignedUserIds: [...(coupon.assignedUserIds || []), userId],
    },
  });
  return NextResponse.json(updated);
}
