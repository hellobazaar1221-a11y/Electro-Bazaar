import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, email, answer, newPassword } = body ?? {};
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user) return NextResponse.json({ error: "No account found with this email" }, { status: 404 });

    if (step === "question") {
      return NextResponse.json({ securityQuestion: user.securityQuestion });
    }
    if (step === "reset") {
      if (!answer || !newPassword) return NextResponse.json({ error: "Answer and new password are required" }, { status: 400 });
      const ok = await bcrypt.compare(String(answer).toLowerCase().trim(), user.securityAnswer);
      if (!ok) return NextResponse.json({ error: "Incorrect security answer" }, { status: 400 });
      if (String(newPassword).length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
