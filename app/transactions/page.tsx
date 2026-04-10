"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Transaction, CartItem } from "@/types";
import { createClient } from "@/lib/supabase";
import { isDemoMode, demoGetTransactions } from "@/lib/demoStore";

type Filter = "today" | "week" | "month" | "all";

function startOf(filter: Filter): Date {
  const now = new Date();
  if (filter === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (filter === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (filter === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(0);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function TransactionsPage() {
  const [all, setAll] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>("today");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      setAll(demoGetTransactions());
      return;
    }
    const supabase = createClient();
    supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setAll(data.map((row) => ({
          id: row.id,
          total: Number(row.total),
          amountPaid: Number(row.amount_paid),
          change: Number(row.change),
          timestamp: row.created_at,
          items: (row.transaction_items ?? []).map((ti: Record<string, unknown>) => ({
            product: {
              id: ti.product_id as string ?? "",
              name: ti.product_name as string,
              emoji: ti.product_emoji as string,
              price: Number(ti.price),
              cogs: 0, stock: 0, reorderQty: 0,
              categoryId: "",
            },
            qty: Number(ti.qty),
          } as CartItem)),
        })));
      });
  }, []);

  const cutoff = startOf(filter);
  const filtered = all.filter((t) => new Date(t.timestamp ?? t.timestamp) >= cutoff);

  const totalSales = filtered.reduce((s, t) => s + t.total, 0);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div className="h-dvh bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-3 md:px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0"
          >
            ← <span className="hidden sm:inline">POS</span>
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-800 text-base md:text-lg leading-tight">🧾 Transactions</h1>
            <p className="text-xs text-gray-400 hidden sm:block">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!confirm("I-download ang transactions CSV?")) return;
            const rows = [
              ["Date", "Time", "Items", "Total", "Amount Paid", "Change"],
              ...filtered.map((t) => [
                formatDate(t.timestamp),
                formatTime(t.timestamp),
                t.items.map((i) => `${i.product.name} x${i.qty}`).join("; "),
                t.total.toFixed(2),
                t.amountPaid.toFixed(2),
                t.change.toFixed(2),
              ]),
            ];
            const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
          }}
          className="flex items-center gap-1 md:gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold text-sm px-3 md:px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0"
        >
          ⬇️ <span className="hidden sm:inline">Download CSV</span>
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              filter === f.key
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4">
        <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Sales</p>
          <p className="text-lg md:text-2xl font-bold text-emerald-600">₱{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Transactions</p>
          <p className="text-lg md:text-2xl font-bold text-gray-800">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Average</p>
          <p className="text-lg md:text-2xl font-bold text-gray-800">
            ₱{filtered.length > 0 ? (totalSales / filtered.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
            <span className="text-6xl">🧾</span>
            <p className="font-semibold text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {filtered.map((txn, idx) => (
              <div key={txn.id}>
                <button
                  onClick={() => setExpanded(expanded === txn.id ? null : txn.id)}
                  className={`w-full text-left px-4 md:px-5 py-4 flex items-center gap-3 md:gap-4 hover:bg-gray-50 transition-colors ${
                    idx < filtered.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-base md:text-lg flex-shrink-0">
                    🧾
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">
                      {txn.items.length} item{txn.items.length !== 1 ? "s" : ""}
                      {" · "}
                      <span className="text-gray-500 font-normal">
                        {txn.items.map((i) => i.product.name).slice(0, 2).join(", ")}
                        {txn.items.length > 2 && ` +${txn.items.length - 2} more`}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(txn.timestamp)} · {formatTime(txn.timestamp)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-600 text-base">₱{txn.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Chng: ₱{txn.change.toFixed(2)}</p>
                  </div>
                  <span className={`text-gray-300 text-sm transition-transform shrink-0 ${expanded === txn.id ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {expanded === txn.id && (
                  <div className="bg-gray-50 border-t border-gray-100 px-4 md:px-5 py-4 space-y-2">
                    {txn.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.product.emoji}</span>
                          <span className="text-gray-700">{item.product.name}</span>
                          <span className="text-gray-400">× {item.qty}</span>
                        </div>
                        <span className="font-semibold text-gray-700">
                          ₱{(item.product.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                      <span>Total Paid</span>
                      <span className="text-emerald-600">₱{txn.amountPaid.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
