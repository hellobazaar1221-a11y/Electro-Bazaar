import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      address: true,
      tracking: { orderBy: { createdAt: "asc" } },
      user: { select: { fullName: true, email: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "ADMIN" && order.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(order);
}
