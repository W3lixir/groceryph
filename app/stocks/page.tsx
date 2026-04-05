"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { getProducts, getCategories, upsertProduct } from "@/lib/store";
import { getStockStatus, STOCK_BADGE } from "@/lib/stockStatus";

type Filter = "all-alerts" | "out" | "low";

export default function StocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [filter, setFilter] = useState<Filter>("all-alerts");
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("");

  const reload = () => {
    setProducts(getProducts());
    setCategories(getCategories());
  };

  useEffect(() => { reload(); }, []);

  const getCat = (id: string) => categories.find((c) => c.id === id);

  const alertItems = products
    .map((p) => ({ p, status: getStockStatus(p) }))
    .filter(({ status }) => status !== "ok")
    .filter(({ status }) => filter === "all-alerts" || status === filter)
    .sort((a, b) => {
      // out first, then low; within same status sort by stock asc
      if (a.status !== b.status) return a.status === "out" ? -1 : 1;
      return (a.p.stock ?? 0) - (b.p.stock ?? 0);
    });

  const outCount = products.filter((p) => getStockStatus(p) === "out").length;
  const lowCount = products.filter((p) => getStockStatus(p) === "low").length;

  const handleRestock = (product: Product) => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    upsertProduct({ ...product, stock: (product.stock ?? 0) + qty });
    setRestockId(null);
    setRestockQty("");
    reload();
  };

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all-alerts", label: "All Alerts", count: outCount + lowCount },
    { key: "out",        label: "Out of Stock", count: outCount },
    { key: "low",        label: "Low Stock",    count: lowCount },
  ];

  return (
    <div className="h-dvh bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95">
            ← POS
          </Link>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">📋 Stock Alerts</h1>
            <p className="text-xs text-gray-400">{outCount} out · {lowCount} low stock</p>
          </div>
        </div>
        <Link href="/inventory" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95">
          📦 Inventory
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 shadow-sm">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outCount}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">{lowCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pb-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 ${
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
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
        {alertItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
            <span className="text-6xl">✅</span>
            <p className="font-semibold text-gray-400">All stocks are good!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Table Header */}
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
                    {/* Product */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                    </div>
                    {/* Category */}
                    <div className="flex items-center gap-1 min-w-0">
                      <span>{cat?.emoji}</span>
                      <span className="text-sm text-gray-500 truncate">{cat?.name}</span>
                    </div>
                    {/* Stock */}
                    <div className="text-right">
                      <span className={`font-bold text-lg ${status === "out" ? "text-red-500" : "text-amber-500"}`}>
                        {p.stock ?? 0}
                      </span>
                    </div>
                    {/* Reorder At */}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">≤ {p.reorderQty ?? 5}</span>
                    </div>
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badge.bg} ${badge.text}`}>
                        {status === "out" ? "OUT" : "LOW"}
                      </span>
                    </div>
                    {/* Restock Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => { setRestockId(p.id); setRestockQty(""); }}
                        className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 active:scale-95 transition-all"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>

                  {/* Inline Restock Input */}
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
        )}
      </div>
    </div>
  );
}
