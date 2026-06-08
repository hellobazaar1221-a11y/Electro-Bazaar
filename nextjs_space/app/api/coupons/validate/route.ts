import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ error: "No coupon code provided" }, { status: 400 });

  const coupon = await prisma.coupon.findFirst({ where: { code: code.toUpperCase().trim() } });

  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!coupon.isActive) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });

  const now = new Date();
  const expiry = new Date(coupon.expiresAt);
  if (now > expiry) return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }

  if (subtotal < coupon.minOrder) {
    return NextResponse.json({
      error: `Minimum order value of ₹${coupon.minOrder} required for this coupon`,
    }, { status: 400 });
  }

  let discount = 0;
  if (coupon.type === "PERCENT") {
    discount = Math.round((subtotal * coupon.value) / 100);
  } else {
    discount = Math.min(coupon.value, subtotal);
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      expiresAt: coupon.expiresAt,
    },
    discount,
  });
}
