"use client";
import { useState } from "react";
import { CartItem } from "@/types";

interface Props {
  items: CartItem[];
  total: number;
  onConfirm: (amountPaid: number) => void;
  onClose: () => void;
}

export default function CheckoutModal({ items, total, onConfirm, onClose }: Props) {
  const [paid, setPaid] = useState(0);

  const change = paid - total;
  const DENOMS = [1, 5, 10, 20, 50, 100, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 text-white px-6 py-5">
          <h2 className="text-xl font-bold">Checkout</h2>
          <p className="text-emerald-100 text-sm mt-1">{items.length} item(s)</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 max-h-36 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product.name} × {item.qty}
                </span>
                <span className="font-semibold">₱{(item.product.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
              <span>TOTAL</span>
              <span className="text-emerald-600">₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600">Amount Paid</p>
              {paid > 0 && (
                <button
                  onClick={() => setPaid(0)}
                  className="text-xs text-red-400 font-semibold hover:text-red-600"
                >
                  ✕ Reset
                </button>
              )}
            </div>

            {/* Running total display */}
            <div className="w-full border-2 border-emerald-400 rounded-xl px-4 py-3 text-2xl font-bold text-center text-gray-900 bg-gray-50">
              ₱{paid.toFixed(2)}
            </div>

            {/* Denomination buttons — always visible, tap to add */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {DENOMS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPaid((prev) => parseFloat((prev + amt).toFixed(2)))}
                  className="py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 active:scale-90 active:bg-emerald-200 transition-all"
                >
                  +₱{amt}
                </button>
              ))}
            </div>

            {/* Change */}
            {paid > 0 && (
              <div className={`mt-3 p-3 rounded-xl text-center font-bold text-lg ${
                change >= 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"
              }`}>
                {change >= 0
                  ? `Change: ₱${change.toFixed(2)}`
                  : `Short: ₱${Math.abs(change).toFixed(2)}`}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-base hover:bg-gray-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(paid)}
              disabled={paid < total}
              className="py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
            >
              Confirm ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
