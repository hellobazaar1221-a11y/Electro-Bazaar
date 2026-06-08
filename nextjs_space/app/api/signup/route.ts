import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, securityQuestion, securityAnswer } = body ?? {};
    if (!email || !password || !fullName || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(String(securityAnswer).toLowerCase().trim(), 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName,
        securityQuestion,
        securityAnswer: hashedAnswer,
        role: "CUSTOMER",
      },
    });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to signup" }, { status: 500 });
  }
}
