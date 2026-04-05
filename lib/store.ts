import { Category, Product, Transaction } from "@/types";
import { categories as defaultCategories, products as defaultProducts } from "@/data/products";

const KEYS = {
  categories: "gpos_categories",
  products: "gpos_products",
  transactions: "gpos_transactions",
};

function seed<T>(key: string, defaults: T[]): T[] {
  if (typeof window === "undefined") return defaults;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(raw) as T[];
}

// Categories
export function getCategories(): Category[] {
  return seed(KEYS.categories, defaultCategories);
}

export function saveCategories(cats: Category[]): void {
  localStorage.setItem(KEYS.categories, JSON.stringify(cats));
}

// Products
export function getProducts(): Product[] {
  return seed(KEYS.products, defaultProducts);
}

export function saveProducts(prods: Product[]): void {
  localStorage.setItem(KEYS.products, JSON.stringify(prods));
}

export function upsertProduct(product: Product): void {
  const prods = getProducts();
  const idx = prods.findIndex((p) => p.id === product.id);
  if (idx >= 0) prods[idx] = product;
  else prods.push(product);
  saveProducts(prods);
}

export function deleteProduct(id: string): void {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function upsertCategory(cat: Category): void {
  const cats = getCategories();
  const idx = cats.findIndex((c) => c.id === cat.id);
  if (idx >= 0) cats[idx] = cat;
  else cats.push(cat);
  saveCategories(cats);
}

export function deleteCategory(id: string): void {
  saveCategories(getCategories().filter((c) => c.id !== id));
  // also remove products in that category
  saveProducts(getProducts().filter((p) => p.categoryId !== id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Transactions
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.transactions);
  return raw ? (JSON.parse(raw) as Transaction[]) : [];
}

export function addTransaction(txn: Transaction): void {
  const txns = getTransactions();
  txns.unshift(txn); // newest first
  localStorage.setItem(KEYS.transactions, JSON.stringify(txns));
}
