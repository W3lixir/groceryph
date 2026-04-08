"use client";
export const dynamic = "force-dynamic";
import { useState, useCallback } from "react";
import { useStore } from "@/hooks/useStore";
import { CartItem, Category, Product } from "@/types";
import { generateId } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { isDemoMode, exitDemo } from "@/lib/demoStore";
import CategoryGrid from "@/components/CategoryGrid";
import ProductPopup from "@/components/ProductPopup";
import Cart from "@/components/Cart";
import CheckoutModal from "@/components/CheckoutModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function POSPage() {
  const { categories, products, saveTransaction } = useStore();
  const router = useRouter();
  const supabase = createClient();
const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [history, setHistory] = useState<CartItem[][]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastTxn, setLastTxn] = useState<{ total: number; change: number; mode: string } | null>(null);

  const categoryProducts = activeCategory
    ? products.filter((p) => p.categoryId === activeCategory.id)
    : [];

  const saveHistory = useCallback((currentCart: CartItem[]) => {
    setHistory((prev) => [...prev, currentCart]);
  }, []);

  const addToCart = (product: Product) => {
    saveHistory(cart);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeOne = (productId: string) => {
    saveHistory(cart);
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (!item) return prev;
      if (item.qty === 1) return prev.filter((i) => i.product.id !== productId);
      return prev.map((i) =>
        i.product.id === productId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCart(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const clearCart = () => {
    saveHistory(cart);
    setCart([]);
  };

  const handleCheckout = async (amountPaid: number) => {
    const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    await saveTransaction({
      id: generateId(),
      items: cart,
      total,
      amountPaid,
      change: amountPaid - total,
      timestamp: new Date().toISOString(),
    });
    setLastTxn({ total, change: amountPaid - total, mode: "Cash" });
    setCart([]);
    setHistory([]);
    setShowCheckout(false);
    setActiveCategory(null);
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="h-dvh bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">My Grocery</h1>
            <p className="text-xs text-gray-400">POS System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">{timeStr}</p>
            <p className="text-xs text-gray-400">{dateStr}</p>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            🧾 Transactions
          </Link>
          <Link
            href="/inventory"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            📦 Inventory
          </Link>
          <button
            onClick={async () => {
              if (isDemoMode()) { exitDemo(); router.push("/login"); return; }
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            🚪 {isDemoMode() ? "Exit Demo" : "Logout"}
          </button>
        </div>
      </header>

      {/* Success Banner */}
      {lastTxn && (
        <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">
              Transaction complete! ₱{lastTxn.total.toFixed(2)} via {lastTxn.mode}
              {lastTxn.mode === "Cash" && lastTxn.change >= 0 && ` — Change: ₱${lastTxn.change.toFixed(2)}`}
            </span>
          </div>
          <button
            onClick={() => setLastTxn(null)}
            className="text-emerald-200 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        {/* Left: Categories */}
        <div className="w-1/2 min-h-0 bg-gray-100 rounded-2xl overflow-y-auto">
          <div className="px-4 pt-4 pb-1">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Categories</h2>
          </div>
          <CategoryGrid
            categories={categories}
            onSelect={(cat) => setActiveCategory(cat)}
            activeId={activeCategory?.id ?? null}
          />
        </div>

        {/* Right: Cart */}
        <div className="w-1/2 min-h-0 h-full">
          <Cart
            items={cart}
            onRemoveOne={removeOne}
            onUndo={undo}
            onClear={clearCart}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      </div>

      {/* Product Popup */}
      {activeCategory && (
        <ProductPopup
          category={activeCategory}
          products={categoryProducts}
          onAddToCart={(product) => {
            addToCart(product);
          }}
          onClose={() => setActiveCategory(null)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          items={cart}
          total={total}
          onConfirm={handleCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
