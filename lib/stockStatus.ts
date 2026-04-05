import { Product, StockStatus } from "@/types";

export function getStockStatus(p: Product): StockStatus {
  if (p.stock <= 0) return "out";
  if (p.stock <= (p.reorderQty ?? 5)) return "low";
  return "ok";
}

export const STOCK_BADGE: Record<StockStatus, { label: string; bg: string; text: string; dot: string }> = {
  out: { label: "Out of Stock", bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-500" },
  low: { label: "Low Stock",    bg: "bg-amber-100",  text: "text-amber-600",  dot: "bg-amber-400" },
  ok:  { label: "In Stock",     bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
};
