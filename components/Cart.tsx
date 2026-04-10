"use client";
import { CartItem } from "@/types";

interface Props {
  items: CartItem[];
  onRemoveOne: (productId: string) => void;
  onUndo: () => void;
  onClear: () => void;
  onCheckout: () => void;
}

export default function Cart({ items, onRemoveOne, onUndo, onClear, onCheckout }: Props) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-500 text-white px-4 md:px-5 py-2 md:py-4">
        <h2 className="text-base md:text-lg font-bold">Current Transaction</h2>
        <p className="text-emerald-100 text-xs md:text-sm">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3 py-10">
            <span className="text-6xl">🛒</span>
            <p className="text-sm font-medium">Cart is empty</p>
            <p className="text-xs">Tap a product to add</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3"
            >
              <span className="text-2xl">{item.product.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500">
                  ₱{item.product.price} × {item.qty}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-600">
                  ₱{(item.product.price * item.qty).toFixed(2)}
                </span>
                <button
                  onClick={() => onRemoveOne(item.product.id)}
                  className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 active:scale-90 transition-all text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-100 px-4 md:px-5 py-2 md:py-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">TOTAL</span>
          <span className="text-xl md:text-2xl font-bold text-gray-800">₱{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onUndo}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-1 py-3 md:py-5 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm md:text-base hover:bg-amber-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↩ UNDO
          </button>
          <button
            onClick={onClear}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-1 py-3 md:py-5 rounded-xl bg-red-100 text-red-600 font-bold text-sm md:text-base hover:bg-red-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            CLEAR
          </button>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-4 md:py-6 rounded-2xl bg-emerald-500 text-white font-bold text-lg md:text-xl hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
        >
          CHECKOUT
        </button>
      </div>
    </div>
  );
}
