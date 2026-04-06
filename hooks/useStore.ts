"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Category, Product, Transaction } from "@/types";
import {
  isDemoMode, demoLoad, demoSaveCategory, demoRemoveCategory,
  demoReorderCategories, demoSaveProduct, demoRemoveProduct,
  demoSaveTransaction,
} from "@/lib/demoStore";
import { generateId } from "@/lib/store";

function mapCategory(row: Record<string, unknown>): Category {
  return { id: row.id as string, name: row.name as string, emoji: row.emoji as string };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    price: Number(row.price),
    cogs: Number(row.cogs ?? 0),
    stock: Number(row.stock ?? 0),
    reorderQty: Number(row.reorder_qty ?? 5),
    categoryId: row.category_id as string,
  };
}

export function useStore() {
  const isDemo = useRef(isDemoMode());
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (isDemo.current) {
      const { categories: cats, products: prods } = demoLoad();
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
      return;
    }
    const [catsRes, prodsRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").order("name"),
    ]);
    setCategories((catsRes.data ?? []).map(mapCategory));
    setProducts((prodsRes.data ?? []).map(mapProduct));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Helper: get current user id
  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  };

  // ── Categories ───────────────────────────────────────────
  const saveCategory = async (cat: Category) => {
    if (isDemo.current) {
      if (!cat.id) cat = { ...cat, id: generateId() };
      demoSaveCategory(cat);
      await load();
      return;
    }
    const uid = await getUserId();
    if (!uid) return;

    const { data: existing } = await supabase
      .from("categories").select("id").eq("id", cat.id).maybeSingle();

    if (existing) {
      await supabase.from("categories")
        .update({ name: cat.name, emoji: cat.emoji })
        .eq("id", cat.id);
    } else {
      await supabase.from("categories").insert({
        id: cat.id,
        user_id: uid,
        name: cat.name,
        emoji: cat.emoji,
        sort_order: categories.length,
      });
    }
    await load();
  };

  const removeCategory = async (id: string) => {
    if (isDemo.current) {
      demoRemoveCategory(id);
      await load();
      return;
    }
    await supabase.from("products").delete().eq("category_id", id);
    await supabase.from("categories").delete().eq("id", id);
    await load();
  };

  const reorderCategories = async (reordered: Category[]) => {
    setCategories(reordered); // optimistic update
    if (isDemo.current) {
      demoReorderCategories(reordered);
      return;
    }
    await Promise.all(
      reordered.map((c, i) =>
        supabase.from("categories").update({ sort_order: i }).eq("id", c.id)
      )
    );
  };

  // ── Products ─────────────────────────────────────────────
  const saveProduct = async (p: Product) => {
    if (isDemo.current) {
      if (!p.id) p = { ...p, id: generateId() };
      demoSaveProduct(p);
      await load();
      return;
    }
    const uid = await getUserId();
    if (!uid) return;

    const { data: existing } = await supabase
      .from("products").select("id").eq("id", p.id).maybeSingle();

    const payload = {
      name: p.name,
      emoji: p.emoji,
      price: p.price,
      cogs: p.cogs,
      stock: p.stock,
      reorder_qty: p.reorderQty,
      category_id: p.categoryId,
    };

    if (existing) {
      await supabase.from("products").update(payload).eq("id", p.id);
    } else {
      await supabase.from("products").insert({ ...payload, id: p.id, user_id: uid });
    }
    await load();
  };

  const removeProduct = async (id: string) => {
    if (isDemo.current) {
      demoRemoveProduct(id);
      await load();
      return;
    }
    await supabase.from("products").delete().eq("id", id);
    await load();
  };

  // ── Transactions ─────────────────────────────────────────
  const saveTransaction = async (txn: Transaction) => {
    if (isDemo.current) {
      demoSaveTransaction(txn);
      await load();
      return;
    }
    const uid = await getUserId();
    if (!uid) return;

    await supabase.from("transactions").insert({
      id: txn.id,
      user_id: uid,
      total: txn.total,
      amount_paid: txn.amountPaid,
      change: txn.change,
    });

    if (txn.items.length > 0) {
      await supabase.from("transaction_items").insert(
        txn.items.map((item) => ({
          transaction_id: txn.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_emoji: item.product.emoji,
          price: item.product.price,
          qty: item.qty,
          subtotal: item.product.price * item.qty,
        }))
      );
    }

    // Decrement stock
    await Promise.all(
      txn.items.map(async (item) => {
        try {
          await supabase.rpc("decrement_stock", {
            product_id: item.product.id,
            qty: item.qty,
          });
        } catch { /* ignore */ }
      })
    );

    await load();
  };

  return {
    categories, products, loading,
    saveCategory, removeCategory, reorderCategories,
    saveProduct, removeProduct,
    saveTransaction,
  };
}
