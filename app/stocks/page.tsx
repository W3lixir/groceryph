"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { createClient } from "@/lib/supabase";
import { getStockStatus, STOCK_BADGE } from "@/lib/stockStatus";
import { isDemoMode, demoLoad, demoRestockProduct } from "@/lib/demoStore";

type Filter = "all-alerts" | "out" | "low";

export default function StocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [filter, setFilter] = useState<Filter>("all-alerts");
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("");

  const reload = async () => {
    if (isDemoMode()) {
      const { products: prods, categories: cats } = demoLoad();
      setCategories(cats);
      setProducts(prods);
      return;
    }
    const supabase = createClient();
    const [prodsRes, catsRes] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("categories").select("*"),
    ]);
    setCategories((catsRes.data ?? []).map((r) => ({ id: r.id, name: r.name, emoji: r.emoji })));
    setProducts((prodsRes.data ?? []).map((r) => ({
      id: r.id, name: r.name, emoji: r.emoji,
      price: Number(r.price), cogs: Number(r.cogs ?? 0),
      stock: Number(r.stock ?? 0), reorderQty: Number(r.reorder_qty ?? 5),
      categoryId: r.category_id,
    })));
  };

  useEffect(() => { reload(); }, []);

  const getCat = (id: string) => categories.find((c) => c.id === id);

  const alertItems = products
    .map((p) => ({ p, status: getStockStatus(p) }))
    .filter(({ status }) => status !== "ok")
    .filter(({ status }) => filter === "all-alerts" || status === filter)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "out" ? -1 : 1;
      return (a.p.stock ?? 0) - (b.p.stock ?? 0);
    });

  const outCount = products.filter((p) => getStockStatus(p) === "out").length;
  const lowCount = products.filter((p) => getStockStatus(p) === "low").length;

  const handleRestock = async (product: Product) => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    if (isDemoMode()) {
      demoRestockProduct(product.id, qty);
    } else {
      const supabase = createClient();
      await supabase.from("products").update({ stock: (product.stock ?? 0) + qty }).eq("id", product.id);
    }
    setRestockId(null);
    setRestockQty("");
    await reload();
  };

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all-alerts", label: "All Alerts", count: outCount + lowCount },
    { key: "out",        label: "Out of Stock", count: outCount },
    { key: "low",        label: "Low Stock",    count: lowCount },
  ];

  return (
    <div className="h-dvh bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-1 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-3 md:px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0">
            ← <span className="hidden sm:inline">POS</span>
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-800 text-base md:text-lg leading-tight">📋 Stock Alerts</h1>
            <p className="text-xs text-gray-400 hidden sm:block">{outCount} out · {lowCount} low stock</p>
          </div>
        </div>
        <Link href="/inventory" className="flex items-center gap-1 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-3 md:px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0">
          📦 <span className="hidden sm:inline">Inventory</span>
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4">
        <div className="bg-white rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total</p>
          <p className="text-lg md:text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 md:p-4 border border-red-100 shadow-sm">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Out</p>
          <p className="text-lg md:text-2xl font-bold text-red-600">{outCount}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 md:p-4 border border-amber-100 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Low</p>
          <p className="text-lg md:text-2xl font-bold text-amber-600">{lowCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 md:px-6 pb-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 ${
              filter === f.key ? "bg-emerald-500 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            {f.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${filter === f.key ? "bg-emerald-400 text-white" : "bg-gray-100 text-gray-500"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-6">
        {alertItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
            <span className="text-6xl">✅</span>
            <p className="font-semibold text-gray-400">All stocks are good!</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="md:hidden space-y-2">
              {alertItems.map(({ p, status }) => {
                const badge = STOCK_BADGE[status];
                const cat = getCat(p.categoryId);
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="text-3xl">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {cat?.emoji} {cat?.name} · Reorder at ≤ {p.reorderQty ?? 5}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-bold ${status === "out" ? "text-red-500" : "text-amber-500"}`}>
                          {p.stock ?? 0}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${badge.bg} ${badge.text}`}>
                          {status === "out" ? "OUT" : "LOW"}
                        </span>
                      </div>
                    </div>
                    {restockId === p.id ? (
                      <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-3 flex items-center gap-2">
                        <input
                          type="number"
                          value={restockQty}
                          onChange={(e) => setRestockQty(e.target.value)}
                          placeholder="Qty"
                          min="1"
                          autoFocus
                          className="w-20 border-2 border-emerald-300 rounded-xl px-3 py-2 text-base text-gray-900 font-bold text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleRestock(p)}
                          disabled={!restockQty || parseInt(restockQty) <= 0}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-95 disabled:opacity-40 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRestockId(null)}
                          className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-gray-50 px-4 py-2">
                        <button
                          onClick={() => { setRestockId(p.id); setRestockQty(""); }}
                          className="w-full py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 active:scale-95 transition-all"
                        >
                          + Restock
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="grid grid-cols-[2fr_1fr_80px_100px_80px_120px] px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Product</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Category</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">Stock</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">Reorder At</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Status</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Restock</span>
              </div>

              {alertItems.map(({ p, status }, idx) => {
                const badge = STOCK_BADGE[status];
                const cat = getCat(p.categoryId);
                return (
                  <div key={p.id}>
                    <div className={`grid grid-cols-[2fr_1fr_80px_100px_80px_120px] items-center px-5 py-4 ${idx < alertItems.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl">{p.emoji}</span>
                        <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span>{cat?.emoji}</span>
                        <span className="text-sm text-gray-500 truncate">{cat?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${status === "out" ? "text-red-500" : "text-amber-500"}`}>
                          {p.stock ?? 0}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">≤ {p.reorderQty ?? 5}</span>
                      </div>
                      <div className="flex justify-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badge.bg} ${badge.text}`}>
                          {status === "out" ? "OUT" : "LOW"}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => { setRestockId(p.id); setRestockQty(""); }}
                          className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 active:scale-95 transition-all"
                        >
                          + Restock
                        </button>
                      </div>
                    </div>
                    {restockId === p.id && (
                      <div className="bg-emerald-50 border-t border-emerald-100 px-5 py-3 flex items-center gap-3">
                        <span className="text-sm font-semibold text-emerald-700">Add stock for {p.name}:</span>
                        <input
                          type="number"
                          value={restockQty}
                          onChange={(e) => setRestockQty(e.target.value)}
                          placeholder="Qty"
                          min="1"
                          autoFocus
                          className="w-24 border-2 border-emerald-300 rounded-xl px-3 py-2 text-base text-gray-900 font-bold text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleRestock(p)}
                          disabled={!restockQty || parseInt(restockQty) <= 0}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-95 disabled:opacity-40 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRestockId(null)}
                          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
