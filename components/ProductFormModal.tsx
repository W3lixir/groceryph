"use client";
import { useEffect, useState } from "react";
import { Category, Product } from "@/types";
import { generateId } from "@/lib/store";

interface Props {
  product?: Product | null;
  categories: Category[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

const EMOJI_GROUPS = [
  { label: "Drinks",      emojis: ["🥤","💧","🍵","🥛","🍫","🧃","🍺","🧋"] },
  { label: "Food",        emojis: ["🍞","🍚","🥖","🫓","🍜","🍗","🥩","🐟","🥚","🧀","🍕","🥕","🥦","🧅","🍎"] },
  { label: "Snacks",      emojis: ["🍬","🍿","🍖","🥔","🍤","🍦","🍰","🎂","🍫","🍭"] },
  { label: "Hygiene",     emojis: ["🧴","🧼","🪥","🧻","🪒","💄","🧽"] },
  { label: "Cleaning",    emojis: ["🧹","🧺","🪣","🫧","🧻","🪠"] },
  { label: "Canned",      emojis: ["🥫","🫙","🐟","🥩","🍅"] },
  { label: "Smoke",       emojis: ["🚬","🪔","💨","🔥"] },
  { label: "Ice",         emojis: ["🧊","❄️","🥶","🍧"] },
  { label: "OTC / Meds",  emojis: ["💊","🩺","🧪","💉","🩹","🏥","🩻"] },
  { label: "Condiments",  emojis: ["🧂","🫙","🍯","🫒","🌶️","🧄","🥫","🍶"] },
  { label: "Others",      emojis: ["📦","🛒","❓","🔧","🪙","📋","🎁","🪝"] },
];

export default function ProductFormModal({ product, categories, onSave, onClose }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cogs, setCogs] = useState("");
  const [stock, setStock] = useState("");
  const [reorderQty, setReorderQty] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [emoji, setEmoji] = useState("🛒");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setCogs((product.cogs ?? 0).toString());
      setStock((product.stock ?? 0).toString());
      setReorderQty((product.reorderQty ?? 5).toString());
      setCategoryId(product.categoryId);
      setEmoji(product.emoji);
    } else {
      setName("");
      setPrice("");
      setCogs("");
      setStock("");
      setReorderQty("5");
      setCategoryId(categories[0]?.id ?? "");
      setEmoji("🛒");
    }
  }, [product, categories]);

  const handleSave = () => {
    if (!name.trim() || !price || !categoryId) return;
    onSave({
      id: product?.id ?? generateId(),
      name: name.trim(),
      price: parseFloat(price),
      cogs: parseFloat(cogs) || 0,
      stock: parseInt(stock) || 0,
      reorderQty: parseInt(reorderQty) || 5,
      categoryId,
      emoji,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 text-white px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-emerald-200 hover:text-white text-2xl font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Emoji Picker */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Icon</p>
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="text-4xl w-16 h-16 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:border-emerald-400 flex items-center justify-center transition-all"
            >
              {emoji}
            </button>
            {showEmojiPicker && (
              <div className="mt-2 bg-gray-50 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label} className="px-3 pt-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{group.label}</p>
                    <div className="flex flex-wrap gap-1 pb-2 border-b border-gray-100 last:border-0">
                      {group.emojis.map((e) => (
                        <button
                          key={group.label + e}
                          onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                          className="text-2xl w-10 h-10 rounded-xl hover:bg-emerald-100 active:scale-90 transition-all"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-1">Product Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wilkins 500ml"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* SRP + COGS side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1">SRP — Selling Price (₱)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.25"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1">COGS — Cost Price (₱)</label>
              <input
                type="number"
                value={cogs}
                onChange={(e) => setCogs(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.25"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Stock + Reorder Qty side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1">Stock (Qty on hand)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1">Reorder Point</label>
              <input
                type="number"
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                placeholder="5"
                min="0"
                step="1"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
              <p className="text-xs text-gray-400 mt-1">Alert when stock ≤ this</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:border-emerald-400 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !price || !categoryId}
              className="py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
            >
              {product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
