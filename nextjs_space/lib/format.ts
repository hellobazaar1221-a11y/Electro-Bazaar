export function formatRupees(value: number | null | undefined): string {
  const num = value ?? 0;
  return "\u20B9" + Math.round(num).toLocaleString("en-IN");
}

export function formatRupeesDecimal(value: number | null | undefined): string {
  const num = value ?? 0;
  return "\u20B9" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const ORDER_STATUSES = [
  "ORDER_RECEIVED",
  "ORDER_ACCEPTED",
  "INVOICE_GENERATED",
  "PACKAGING_STARTED",
  "PACKAGING_COMPLETED",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "IN_TRANSIT",
  "REACHED_LOCAL_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  ORDER_RECEIVED: "Order Received",
  ORDER_ACCEPTED: "Order Accepted",
  INVOICE_GENERATED: "Invoice Generated",
  PACKAGING_STARTED: "Packaging Started",
  PACKAGING_COMPLETED: "Packaging Completed",
  READY_FOR_DISPATCH: "Ready For Dispatch",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit",
  REACHED_LOCAL_HUB: "Reached Local Hub",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function getStatusIndex(status: string): number {
  return ORDER_STATUSES.indexOf(status as any);
}

export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "In which city were you born?",
  "What is your favorite movie?",
  "What is your favorite food?",
  "What was the model of your first car?",
];
