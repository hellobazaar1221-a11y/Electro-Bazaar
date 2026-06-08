import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
  const role = (session.user as any).role as string;
  if (role !== "ADMIN") return { error: "Forbidden", status: 403 };
  return { userId: (session.user as any).id as string, session };
}
