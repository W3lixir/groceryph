export interface Product {
  id: string;
  name: string;
  price: number;   // SRP
  cogs: number;    // Cost of Goods Sold
  stock: number;   // Quantity on hand
  categoryId: string;
  emoji: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  amountPaid: number;
  change: number;
  timestamp: string; // ISO string
}
