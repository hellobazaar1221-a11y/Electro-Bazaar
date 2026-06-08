import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { productId, quantity = 1 } = await req.json();
  if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  const existing = await prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } });
  let item;
  if (existing) {
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { userId, productId, quantity },
      include: { product: true },
    });
  }
  return NextResponse.json(item);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { itemId, quantity } = await req.json();
  if (!itemId || quantity < 1) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const clearAll = searchParams.get("clearAll");
  if (clearAll === "true") {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return NextResponse.json({ success: true });
  }
  if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
