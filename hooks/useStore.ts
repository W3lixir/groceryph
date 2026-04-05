"use client";
import { useEffect, useState } from "react";
import { Category, Product } from "@/types";
import {
  getCategories,
  getProducts,
  saveCategories,
  upsertProduct,
  deleteProduct,
  upsertCategory,
  deleteCategory,
} from "@/lib/store";

export function useStore() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCategories(getCategories());
    setProducts(getProducts());

    // Re-read categories when drag-and-drop reorder happens
    const onReorder = () => setCategories(getCategories());
    window.addEventListener("gpos-categories-updated", onReorder);
    return () => window.removeEventListener("gpos-categories-updated", onReorder);
  }, []);

  const refreshProducts = () => setProducts(getProducts());
  const refreshCategories = () => setCategories(getCategories());

  return {
    categories,
    products,
    saveProduct: (p: Product) => { upsertProduct(p); refreshProducts(); },
    removeProduct: (id: string) => { deleteProduct(id); refreshProducts(); },
    saveCategory: (c: Category) => { upsertCategory(c); refreshCategories(); },
    removeCategory: (id: string) => { deleteCategory(id); refreshCategories(); refreshProducts(); },
  };
}
