import { Category, Product, Transaction } from "@/types";
import { categories as seedCats, products as seedProds } from "@/data/products";

export const DEMO_KEY = "groceryph_demo";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "true";
}

function getLS<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initDemo() {
  if (localStorage.getItem("demo_categories")) return;
  const demoProds = seedProds.map((p) => {
    if (p.id === "d1") return { ...p, stock: 0 };   // Wilkins — out of stock
    if (p.id === "b1") return { ...p, stock: 3 };   // Tasty Bread — low
    if (p.id === "h3") return { ...p, stock: 2 };   // Head & Shoulders — low
    return p;
  });
  setLS("demo_categories", seedCats);
  setLS("demo_products", demoProds);
  setLS("demo_transactions", []);
}

export function demoLoad(): { categories: Category[]; products: Product[] } {
  initDemo();
  return {
    categories: getLS<Category[]>("demo_categories") ?? seedCats,
    products: getLS<Product[]>("demo_products") ?? seedProds,
  };
}

export function demoSaveCategory(cat: Category) {
  const cats = getLS<Category[]>("demo_categories") ?? [];
  const idx = cats.findIndex((c) => c.id === cat.id);
  if (idx >= 0) cats[idx] = cat;
  else cats.push(cat);
  setLS("demo_categories", cats);
}

export function demoRemoveCategory(id: string) {
  const cats = (getLS<Category[]>("demo_categories") ?? []).filter((c) => c.id !== id);
  const prods = (getLS<Product[]>("demo_products") ?? []).filter((p) => p.categoryId !== id);
  setLS("demo_categories", cats);
  setLS("demo_products", prods);
}

export function demoReorderCategories(reordered: Category[]) {
  setLS("demo_categories", reordered);
}

export function demoSaveProduct(p: Product) {
  const prods = getLS<Product[]>("demo_products") ?? [];
  const idx = prods.findIndex((x) => x.id === p.id);
  if (idx >= 0) prods[idx] = p;
  else prods.push(p);
  setLS("demo_products", prods);
}

export function demoRemoveProduct(id: string) {
  const prods = (getLS<Product[]>("demo_products") ?? []).filter((p) => p.id !== id);
  setLS("demo_products", prods);
}

export function demoSaveTransaction(txn: Transaction) {
  const txns = getLS<Transaction[]>("demo_transactions") ?? [];
  txns.unshift(txn);
  setLS("demo_transactions", txns);

  // Decrement stock
  const prods = getLS<Product[]>("demo_products") ?? [];
  txn.items.forEach((item) => {
    const prod = prods.find((p) => p.id === item.product.id);
    if (prod) prod.stock = Math.max(0, (prod.stock ?? 0) - item.qty);
  });
  setLS("demo_products", prods);
}

export function demoGetTransactions(): Transaction[] {
  return getLS<Transaction[]>("demo_transactions") ?? [];
}

export function demoRestockProduct(id: string, qty: number) {
  const prods = getLS<Product[]>("demo_products") ?? [];
  const prod = prods.find((p) => p.id === id);
  if (prod) prod.stock = (prod.stock ?? 0) + qty;
  setLS("demo_products", prods);
}

export function exitDemo() {
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem("demo_categories");
  localStorage.removeItem("demo_products");
  localStorage.removeItem("demo_transactions");
  document.cookie = "groceryph_demo=; path=/; max-age=0";
}
