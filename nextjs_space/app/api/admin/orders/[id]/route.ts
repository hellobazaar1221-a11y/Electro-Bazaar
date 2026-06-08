import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      address: true,
      user: { select: { fullName: true, email: true, phone: true } },
      tracking: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Transform for client
  const transformed = {
    ...order,
    user: order.user
      ? { name: order.user.fullName, email: order.user.email, phone: order.user.phone }
      : null,
    shippingAddress: order.address
      ? {
          fullName: order.address.fullName,
          phone: order.address.phone,
          line1: order.address.addressLine1,
          line2: order.address.addressLine2,
          city: order.address.city,
          state: order.address.state,
          pincode: order.address.pincode,
        }
      : null,
  };
  return NextResponse.json({ order: transformed });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  const { status, note, invoiceUrl } = body;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: any = {};

  if (invoiceUrl !== undefined) {
    updateData.invoiceUrl = invoiceUrl;
  }

  if (status !== undefined) {
    if (!status || (!(ORDER_STATUSES as readonly string[]).includes(status) && status !== "CANCELLED")) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = status;
    updateData.paymentStatus = status === "DELIVERED" && order.paymentMethod === "COD" ? "PAID" : order.paymentStatus;

    await prisma.orderTracking.create({
      data: { orderId: params.id, status, note: note ?? ORDER_STATUS_LABELS[status] ?? null },
    });
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });
  }
  return NextResponse.json({ success: true });
}
