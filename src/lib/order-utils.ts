/**
 * Shared Order & Payment Resolution Utilities
 * Ensures 100% synchronization between Admin Orders Table, Order Details Modal, and Tax Invoices
 */

export type PaymentStatusType =
  | "PAID"
  | "PARTIALLY_PAID"
  | "COD_PENDING"
  | "COD_DELIVERED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";

export interface ResolvedPaymentDetails {
  status: PaymentStatusType;
  isPaid: boolean;
  isPartialCod: boolean;
  isCod: boolean;
  isCodDelivered: boolean;
  isRefunded: boolean;
  isFailed: boolean;
  method: string;
  badgeText: string;
  badgeClass: string; // CSS class for invoice HTML
  tailwindBadgeClass: string; // Tailwind class for react components
  advancePaid: number;
  balanceDue: number;
  amountPaid: number;
  totalAmount: number;
  transactionId: string;
}

export function formatPaymentMethod(rawMethod?: string): string {
  if (!rawMethod) return "Online Payment";
  const m = String(rawMethod).trim().toLowerCase();

  if (m === "upi") return "UPI";
  if (m.includes("netbanking") || m.includes("net_banking")) return "NetBanking";
  if (m.includes("card") || m.includes("debit") || m.includes("credit")) return "Card (Credit/Debit)";
  if (m.includes("wallet")) return "Wallet";
  if (m.includes("cod") || m.includes("cash on delivery")) return "Cash on Delivery (COD)";
  if (m.includes("partial")) return "Partial COD";
  if (m.includes("stripe")) return "Stripe (Card)";
  if (m.includes("razorpay")) return "Razorpay Online";
  if (m.includes("cashfree")) return "Cashfree Online";

  // Capitalize words
  return rawMethod
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const PAID_STATUSES = new Set([
  "paid",
  "success",
  "succeeded",
  "completed",
  "captured",
  "settled",
]);

/**
 * Resolves payment status, badges, amounts, and methods consistently
 * across Admin Orders Table, Order Detail Modal, and Tax Invoices.
 */
export function resolveOrderPaymentStatus(order: any): ResolvedPaymentDetails {
  if (!order) {
    return {
      status: "PENDING",
      isPaid: false,
      isPartialCod: false,
      isCod: false,
      isCodDelivered: false,
      isRefunded: false,
      isFailed: false,
      method: "N/A",
      badgeText: "PENDING",
      badgeClass: "badge-pending",
      tailwindBadgeClass: "bg-yellow-100 text-yellow-800",
      advancePaid: 0,
      balanceDue: 0,
      amountPaid: 0,
      totalAmount: 0,
      transactionId: "N/A",
    };
  }

  const rawStatus = String(
    order.paymentInfo?.status ||
      order.paymentStatus ||
      order.payment?.status ||
      (order.isPaid ? "paid" : "") ||
      ""
  ).trim().toLowerCase();

  const rawMethod = String(
    order.paymentInfo?.method ||
      order.paymentMethod ||
      order.payment?.method ||
      ""
  ).trim().toLowerCase();

  const orderStatus = String(
    order.orderStatus || order.status || ""
  ).trim().toLowerCase();

  const isPartialCod = Boolean(
    order.isPartialCod ||
      rawMethod === "partial cod" ||
      rawStatus === "partially paid" ||
      (Number(order.advancePayment || order.paymentInfo?.advanceAmount || 0) > 0 &&
        Number(order.remainingBalance || order.paymentInfo?.dueAmount || 0) > 0)
  );

  const isCod = !isPartialCod && (
    rawMethod === "cod" ||
    rawMethod === "cash on delivery" ||
    rawMethod.includes("cod")
  );

  const isDelivered = orderStatus === "delivered";

  const totalAmount = Number(order.totalPrice ?? order.totalAmount ?? 0);
  const advancePaid = Number(order.advancePayment ?? order.paymentInfo?.advanceAmount ?? 0);
  const balanceDue = Number(
    order.remainingBalance ??
      order.paymentInfo?.dueAmount ??
      (isPartialCod ? Math.max(0, totalAmount - advancePaid) : isCod ? totalAmount : 0)
  );

  const transactionId = String(
    order.paymentInfo?.id ||
      order.paymentInfo?.transactionId ||
      order.paymentInfo?.razorpay_payment_id ||
      order.paymentId ||
      (isCod ? "COD-ORDER" : "N/A")
  );

  const isPaidExplicit =
    order.isPaid === true ||
    Boolean(order.paidAt) ||
    PAID_STATUSES.has(rawStatus);

  const isRefunded =
    rawStatus === "refunded" ||
    rawStatus === "refund" ||
    orderStatus === "refunded";

  const isFailed =
    rawStatus === "failed" ||
    rawStatus === "failure" ||
    rawStatus === "declined";

  const formattedMethod = formatPaymentMethod(
    order.paymentInfo?.method || (isPartialCod ? "Partial COD" : isCod ? "Cash on Delivery" : "Online")
  );

  // 1. Refunded
  if (isRefunded) {
    return {
      status: "REFUNDED",
      isPaid: false,
      isPartialCod,
      isCod,
      isCodDelivered: false,
      isRefunded: true,
      isFailed: false,
      method: formattedMethod,
      badgeText: "REFUNDED",
      badgeClass: "badge-pending",
      tailwindBadgeClass: "bg-gray-100 text-gray-800",
      advancePaid,
      balanceDue,
      amountPaid: 0,
      totalAmount,
      transactionId,
    };
  }

  // 2. Failed
  if (isFailed) {
    return {
      status: "FAILED",
      isPaid: false,
      isPartialCod,
      isCod,
      isCodDelivered: false,
      isRefunded: false,
      isFailed: true,
      method: formattedMethod,
      badgeText: "PAYMENT FAILED",
      badgeClass: "badge-pending",
      tailwindBadgeClass: "bg-red-100 text-red-800",
      advancePaid,
      balanceDue,
      amountPaid: 0,
      totalAmount,
      transactionId,
    };
  }

  // 3. Partial COD
  if (isPartialCod) {
    if (isDelivered || rawStatus === "paid" || rawStatus === "completed") {
      return {
        status: "PAID",
        isPaid: true,
        isPartialCod: true,
        isCod: true,
        isCodDelivered: true,
        isRefunded: false,
        isFailed: false,
        method: "Partial COD (Settled)",
        badgeText: "PAID (PARTIAL COD SETTLED)",
        badgeClass: "badge-paid",
        tailwindBadgeClass: "bg-green-100 text-green-800",
        advancePaid,
        balanceDue: 0,
        amountPaid: totalAmount,
        totalAmount,
        transactionId,
      };
    }

    return {
      status: "PARTIALLY_PAID",
      isPaid: false,
      isPartialCod: true,
      isCod: true,
      isCodDelivered: false,
      isRefunded: false,
      isFailed: false,
      method: "Partial COD",
      badgeText: "PARTIAL COD (ADVANCE PAID)",
      badgeClass: "badge-partial",
      tailwindBadgeClass: "bg-amber-100 text-amber-800",
      advancePaid,
      balanceDue,
      amountPaid: advancePaid,
      totalAmount,
      transactionId,
    };
  }

  // 4. Pure Cash on Delivery (COD)
  if (isCod) {
    if (isDelivered) {
      return {
        status: "COD_DELIVERED",
        isPaid: true,
        isPartialCod: false,
        isCod: true,
        isCodDelivered: true,
        isRefunded: false,
        isFailed: false,
        method: formattedMethod,
        badgeText: "PAID ON DELIVERY (COD)",
        badgeClass: "badge-paid",
        tailwindBadgeClass: "bg-green-100 text-green-800",
        advancePaid: 0,
        balanceDue: 0,
        amountPaid: totalAmount,
        totalAmount,
        transactionId,
      };
    }

    return {
      status: "COD_PENDING",
      isPaid: false,
      isPartialCod: false,
      isCod: true,
      isCodDelivered: false,
      isRefunded: false,
      isFailed: false,
      method: formattedMethod,
      badgeText: "COD - PAY ON DELIVERY",
      badgeClass: "badge-cod",
      tailwindBadgeClass: "bg-yellow-100 text-yellow-800",
      advancePaid: 0,
      balanceDue: totalAmount,
      amountPaid: 0,
      totalAmount,
      transactionId,
    };
  }

  // 5. Explicitly Paid Online (status = 'paid', 'success', 'succeeded', 'completed', 'captured', 'settled' OR isPaid = true)
  if (isPaidExplicit) {
    return {
      status: "PAID",
      isPaid: true,
      isPartialCod: false,
      isCod: false,
      isCodDelivered: false,
      isRefunded: false,
      isFailed: false,
      method: formattedMethod,
      badgeText: "PAID",
      badgeClass: "badge-paid",
      tailwindBadgeClass: "bg-green-100 text-green-800",
      advancePaid: 0,
      balanceDue: 0,
      amountPaid: totalAmount,
      totalAmount,
      transactionId,
    };
  }

  // 6. Genuinely pending online payment
  return {
    status: "PENDING",
    isPaid: false,
    isPartialCod: false,
    isCod: false,
    isCodDelivered: false,
    isRefunded: false,
    isFailed: false,
    method: formattedMethod,
    badgeText: "PAYMENT PENDING",
    badgeClass: "badge-pending",
    tailwindBadgeClass: "bg-yellow-100 text-yellow-800",
    advancePaid: 0,
    balanceDue: totalAmount,
    amountPaid: 0,
    totalAmount,
    transactionId,
  };
}
