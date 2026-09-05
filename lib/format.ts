import type { Currency, Invoice, LineItem } from "./types";

export const CURRENCIES: Record<Currency, { symbol: string; label: string }> = {
  NGN: { symbol: "₦", label: "Nigerian Naira" },
  USD: { symbol: "$", label: "US Dollar" },
  GBP: { symbol: "£", label: "British Pound" },
  EUR: { symbol: "€", label: "Euro" },
  CAD: { symbol: "C$", label: "Canadian Dollar" },
};

export function money(amount: number, currency: Currency) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "NGN" ? 0 : 2,
    }).format(amount || 0);
  } catch {
    return `${CURRENCIES[currency].symbol}${(amount || 0).toLocaleString()}`;
  }
}

export function naira(amount: number) {
  return money(amount, "NGN");
}

export function itemTotal(item: LineItem) {
  return (item.quantity || 0) * (item.rate || 0);
}

export function invoiceTotals(invoice: Invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + itemTotal(item), 0);
  const discount =
    invoice.discountType === "percent"
      ? subtotal * ((invoice.discount || 0) / 100)
      : invoice.discount || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * ((invoice.taxRate || 0) / 100);
  const total = afterDiscount + tax;
  const deposit = total * ((invoice.depositPercent || 0) / 100);
  const balance = Math.max(0, total - (invoice.paidAmount || 0));
  return { subtotal, discount, tax, total, deposit, balance };
}

export function prettyDate(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function nextInvoiceNumber(existing: Invoice[]) {
  const year = new Date().getFullYear();
  const count = existing.filter((inv) => inv.number.includes(String(year))).length + 1;
  return `INV-${year}-${String(count).padStart(4, "0")}`;
}

export function isOverdue(invoice: Invoice) {
  if (invoice.status === "paid" || invoice.status === "void" || invoice.status === "draft") {
    return false;
  }
  return invoice.dueDate < todayISO() && invoiceTotals(invoice).balance > 0;
}

export const CREATIVE_FIELDS = [
  "Content creator",
  "Videographer",
  "Photographer",
  "Product designer",
  "Software engineer",
  "Backend developer",
  "Frontend developer",
  "Motion designer",
  "Brand designer",
  "Copywriter",
  "Music producer",
  "Illustrator",
  "UX researcher",
  "Creative director",
  "Social media manager",
  "Other",
] as const;
