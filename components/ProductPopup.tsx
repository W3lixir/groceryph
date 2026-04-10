"use client";
import { Category, Product } from "@/types";

interface Props {
  category: Category;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onClose: () => void;
}

export default function ProductPopup({ category, products, onAddToCart, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex md:items-start md:justify-start items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white md:rounded-2xl rounded-t-3xl shadow-2xl md:mt-4 md:ml-4 w-full md:max-w-[680px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.emoji}</span>
            <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-all text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 p-4 max-h-[55vh] md:max-h-[80vh] overflow-y-auto">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onAddToCart(product)}
              className="
                flex flex-col items-center justify-center gap-2
                rounded-2xl py-5 px-2 bg-gray-50 border border-gray-100
                hover:bg-emerald-50 hover:border-emerald-300
                active:scale-95 active:bg-emerald-100
                transition-all select-none shadow-sm
              "
            >
              <span className="text-4xl md:text-5xl">{product.emoji}</span>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center leading-tight">
                {product.name}
              </span>
              <span className="text-sm md:text-base font-bold text-emerald-600">
                ₱{product.price}
              </span>
            </button>
          ))}
        </div>

        {/* Tap outside hint */}
        <div className="text-center text-xs text-gray-400 pb-4">
          Tap outside to close
        </div>
      </div>
    </div>
  );
}
