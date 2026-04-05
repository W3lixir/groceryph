"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/useStore";
import { Category, Product } from "@/types";
import ProductFormModal from "@/components/ProductFormModal";
import CategoryFormModal from "@/components/CategoryFormModal";

export default function InventoryPage() {
  const { categories, products, saveProduct, removeProduct, saveCategory, removeCategory } = useStore();

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [editProduct, setEditProduct] = useState<Product | null | "new">(null);
  const [editCategory, setEditCategory] = useState<Category | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "product" | "category"; id: string; name: string } | null>(null);

  const filtered = products.filter((p) => {
    const matchCat = activeCategoryId === "all" || p.categoryId === activeCategoryId;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const getCategoryEmoji = (id: string) => categories.find((c) => c.id === id)?.emoji ?? "📦";

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            ← POS
          </Link>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">📦 Inventory</h1>
            <p className="text-xs text-gray-400">{products.length} products · {categories.length} categories</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditCategory("new")}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            + Category
          </button>
          <button
            onClick={() => setEditProduct("new")}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-200"
          >
            + Product
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left: Category Sidebar */}
        <aside className="w-48 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
          <div className="p-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Categories</p>
            <button
              onClick={() => setActiveCategoryId("all")}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all mb-1 ${
                activeCategoryId === "all"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🗂 All ({products.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="group relative">
                  <button
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all pr-14 ${
                      activeCategoryId === cat.id
                        ? "bg-emerald-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat.emoji} {cat.name}
                    <span className={`ml-1 text-xs ${activeCategoryId === cat.id ? "text-emerald-100" : "text-gray-400"}`}>
                      ({count})
                    </span>
                  </button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                    <button
                      onClick={() => setEditCategory(cat)}
                      className="w-6 h-6 rounded-lg bg-white shadow text-gray-500 hover:text-emerald-600 text-xs flex items-center justify-center"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ type: "category", id: cat.id, name: cat.name })}
                      className="w-6 h-6 rounded-lg bg-white shadow text-gray-500 hover:text-red-500 text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right: Product List */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 pb-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍  Search products..."
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Product Table */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                <span className="text-6xl">📭</span>
                <p className="font-semibold">No products found</p>
                <button
                  onClick={() => setEditProduct("new")}
                  className="text-sm text-emerald-500 font-semibold hover:underline"
                >
                  + Add one
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_80px_90px_90px_160px] px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Product</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Category</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">Stock</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">COGS</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-right">SRP</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Actions</span>
                </div>

                {filtered.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-[2fr_1fr_80px_90px_90px_160px] items-center px-5 py-4 ${
                      idx < filtered.length - 1 ? "border-b border-gray-50" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    {/* Product Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{product.emoji}</span>
                      <span className="font-semibold text-gray-800 truncate">{product.name}</span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-1 min-w-0">
                      <span>{getCategoryEmoji(product.categoryId)}</span>
                      <span className="text-sm text-gray-500 truncate">{getCategoryName(product.categoryId)}</span>
                    </div>

                    {/* Stock */}
                    <div className="text-right">
                      <span className={`font-bold text-sm ${product.stock <= 5 ? "text-red-500" : product.stock <= 15 ? "text-amber-500" : "text-gray-700"}`}>
                        {product.stock ?? 0}
                      </span>
                    </div>

                    {/* COGS */}
                    <div className="text-right">
                      <span className="text-sm text-gray-500 font-medium">₱{(product.cogs ?? 0).toFixed(2)}</span>
                    </div>

                    {/* SRP */}
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 text-sm">₱{product.price.toFixed(2)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ type: "product", id: product.id, name: product.name })}
                        className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {editProduct !== null && (
        <ProductFormModal
          product={editProduct === "new" ? null : editProduct}
          categories={categories}
          onSave={(p) => { saveProduct(p); setEditProduct(null); }}
          onClose={() => setEditProduct(null)}
        />
      )}

      {/* Category Form Modal */}
      {editCategory !== null && (
        <CategoryFormModal
          category={editCategory === "new" ? null : editCategory}
          onSave={(c) => { saveCategory(c); setEditCategory(null); }}
          onClose={() => setEditCategory(null)}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center space-y-4">
            <span className="text-5xl">🗑️</span>
            <div>
              <p className="font-bold text-gray-800 text-lg">Delete {confirmDelete.type}?</p>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-semibold text-gray-700">{confirmDelete.name}</span>
                {confirmDelete.type === "category" && (
                  <span className="block text-red-400 mt-1 text-xs">This will also delete all products in this category.</span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === "product") removeProduct(confirmDelete.id);
                  else removeCategory(confirmDelete.id);
                  setConfirmDelete(null);
                  if (confirmDelete.type === "category" && activeCategoryId === confirmDelete.id) {
                    setActiveCategoryId("all");
                  }
                }}
                className="py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
