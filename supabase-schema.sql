-- =============================================
-- GROCERY POS — SUPABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. PROFILES (one per user / store)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  store_name  TEXT NOT NULL DEFAULT 'My Grocery',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '📦',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id, sort_order);

-- ─────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id      UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id  TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  emoji        TEXT NOT NULL DEFAULT '🛒',
  price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  cogs         NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock        INTEGER NOT NULL DEFAULT 0,
  reorder_qty  INTEGER NOT NULL DEFAULT 5,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user     ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- ─────────────────────────────────────────────
-- 4. TRANSACTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id      UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  total        NUMERIC(10,2) NOT NULL,
  amount_paid  NUMERIC(10,2) NOT NULL,
  change       NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 5. TRANSACTION ITEMS (snapshot at time of sale)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transaction_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id      TEXT,                  -- nullable: product may be deleted later
  product_name    TEXT NOT NULL,
  product_emoji   TEXT NOT NULL DEFAULT '🛒',
  price           NUMERIC(10,2) NOT NULL,
  qty             INTEGER NOT NULL,
  subtotal        NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_txn_items_txn ON transaction_items(transaction_id);

-- ─────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Own profile only" ON profiles
  USING (auth.uid() = id);

-- Categories
CREATE POLICY "Own categories only" ON categories
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Products
CREATE POLICY "Own products only" ON products
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Own transactions only" ON transactions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transaction Items (access via parent transaction)
CREATE POLICY "View own transaction items" ON transaction_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Insert own transaction items" ON transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
        AND t.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 7. AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, store_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'store_name', 'My Grocery'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- 8. DECREMENT STOCK FUNCTION (called on checkout)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = product_id
    AND user_id = auth.uid();
END;
$$;

-- ─────────────────────────────────────────────
-- DONE ✓
-- ─────────────────────────────────────────────
