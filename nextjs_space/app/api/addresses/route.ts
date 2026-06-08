import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const data = await req.json();
  const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = data ?? {};
  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
  }
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }
  const existing = await prisma.address.count({ where: { userId } });
  const address = await prisma.address.create({
    data: { userId, fullName, phone, addressLine1, addressLine2: addressLine2 ?? null, city, state, pincode, isDefault: isDefault ?? existing === 0 },
  });
  return NextResponse.json(address);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const addr = await prisma.address.findFirst({ where: { id, userId } });
  if (!addr) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
