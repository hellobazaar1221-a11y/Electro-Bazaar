import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RK-${ts}-${rand}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true, address: true, tracking: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { addressId, paymentMethod, notes, couponCode } = await req.json();
  if (!addressId || !paymentMethod) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (cartItems.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const subtotal = cartItems.reduce((s: number, c: any) => s + c.product.price * c.quantity, 0);
  const shipping = subtotal > 10000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);

  let verifiedDiscount = 0;
  let appliedCoupon: any = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (coupon && coupon.isActive) {
      const now = new Date();
      const expiry = new Date(coupon.expiresAt);
      const isExpired = now > expiry;
      const usageLimitReached = coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses;
      const minOrderSatisfied = subtotal >= coupon.minOrder;

      if (!isExpired && !usageLimitReached && minOrderSatisfied) {
        appliedCoupon = coupon;
        if (coupon.type === "PERCENT") {
          verifiedDiscount = Math.round((subtotal * coupon.value) / 100);
        } else {
          verifiedDiscount = Math.min(coupon.value, subtotal);
        }
      }
    }
  }

  const total = Math.max(0, subtotal + shipping + tax - verifiedDiscount);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      addressId,
      subtotal, 
      shipping, 
      tax, 
      total,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      couponDiscount: verifiedDiscount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
      status: "ORDER_RECEIVED",
      notes: notes ?? null,
      items: {
        create: cartItems.map((ci: any) => ({
          productId: ci.productId,
          name: ci.product.name,
          image: ci.product.image,
          price: ci.product.price,
          quantity: ci.quantity,
        })),
      },
      tracking: {
        create: { status: "ORDER_RECEIVED", note: "Your order has been received and is being processed." },
      },
    },
    include: { items: true, address: true, tracking: true },
  });

  // Increment coupon usage count
  if (appliedCoupon) {
    await prisma.coupon.update({
      where: { id: appliedCoupon.id },
      data: { usedCount: (appliedCoupon.usedCount ?? 0) + 1 },
    });
  }

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { userId } });

  return NextResponse.json(order);
}
