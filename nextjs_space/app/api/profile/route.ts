import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, phone: true, role: true, createdAt: true, securityQuestion: true, image: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { fullName, phone, image } = await req.json();
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName ?? undefined,
      phone: phone ?? undefined,
      image: image ?? undefined,
    },
    select: { id: true, email: true, fullName: true, phone: true, role: true, image: true },
  });
  return NextResponse.json(updated);
}
