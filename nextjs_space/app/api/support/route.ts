import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const ticket = await prisma.supportTicket.create({
    data: {
      name, email, subject, message,
      userId: (session?.user as any)?.id ?? null,
    },
  });
  return NextResponse.json(ticket);
}
