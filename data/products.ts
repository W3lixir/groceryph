import { Category, Product } from "@/types";

export const categories: Category[] = [
  { id: "drinks", name: "Drinks", emoji: "🥤" },
  { id: "bread", name: "Bread", emoji: "🍞" },
  { id: "rice", name: "Rice", emoji: "🍚" },
  { id: "snacks", name: "Snacks", emoji: "🍬" },
  { id: "hygiene", name: "Hygiene", emoji: "🧴" },
  { id: "eggs", name: "Eggs", emoji: "🥚" },
  { id: "canned", name: "Canned", emoji: "🥫" },
  { id: "cleaning", name: "Cleaning", emoji: "🧹" },
];

export const products: Product[] = [
  // Drinks
  { id: "d1", name: "Wilkins 500ml",    price: 20,  cogs: 15,  stock: 50,  reorderQty: 10, categoryId: "drinks",   emoji: "💧" },
  { id: "d2", name: "Absolute 500ml",   price: 22,  cogs: 17,  stock: 30,  reorderQty: 10, categoryId: "drinks",   emoji: "💧" },
  { id: "d3", name: "C2 Green Tea",     price: 25,  cogs: 19,  stock: 40,  reorderQty: 10, categoryId: "drinks",   emoji: "🍵" },
  { id: "d4", name: "Sprite 1.5L",      price: 55,  cogs: 45,  stock: 20,  reorderQty: 5,  categoryId: "drinks",   emoji: "🥤" },
  { id: "d5", name: "Coke 1.5L",        price: 58,  cogs: 47,  stock: 20,  reorderQty: 5,  categoryId: "drinks",   emoji: "🥤" },
  { id: "d6", name: "Royal 1.5L",       price: 52,  cogs: 42,  stock: 15,  reorderQty: 5,  categoryId: "drinks",   emoji: "🥤" },
  { id: "d7", name: "Milo 200ml",       price: 18,  cogs: 13,  stock: 60,  reorderQty: 15, categoryId: "drinks",   emoji: "🍫" },
  { id: "d8", name: "Bear Brand 300ml", price: 30,  cogs: 24,  stock: 25,  reorderQty: 10, categoryId: "drinks",   emoji: "🥛" },

  // Bread
  { id: "b1", name: "Tasty Bread",      price: 55,  cogs: 45,  stock: 10,  reorderQty: 5,  categoryId: "bread",    emoji: "🍞" },
  { id: "b2", name: "Pandesal (6pcs)",  price: 30,  cogs: 22,  stock: 20,  reorderQty: 8,  categoryId: "bread",    emoji: "🥖" },
  { id: "b3", name: "Skyflakes",        price: 15,  cogs: 11,  stock: 30,  reorderQty: 10, categoryId: "bread",    emoji: "🫓" },

  // Rice
  { id: "r1", name: "Rice 1kg",         price: 52,  cogs: 46,  stock: 100, reorderQty: 20, categoryId: "rice",     emoji: "🍚" },
  { id: "r2", name: "Rice 5kg",         price: 250, cogs: 225, stock: 30,  reorderQty: 5,  categoryId: "rice",     emoji: "🍚" },
  { id: "r3", name: "Sinandomeng 1kg",  price: 58,  cogs: 52,  stock: 80,  reorderQty: 20, categoryId: "rice",     emoji: "🍚" },

  // Snacks
  { id: "s1", name: "Nova BBQ",         price: 22,  cogs: 16,  stock: 40,  reorderQty: 10, categoryId: "snacks",   emoji: "🍿" },
  { id: "s2", name: "Chicharon",        price: 15,  cogs: 10,  stock: 50,  reorderQty: 10, categoryId: "snacks",   emoji: "🍖" },
  { id: "s3", name: "Piattos",          price: 25,  cogs: 19,  stock: 35,  reorderQty: 10, categoryId: "snacks",   emoji: "🥔" },
  { id: "s4", name: "Oishi Prawn",      price: 20,  cogs: 15,  stock: 45,  reorderQty: 10, categoryId: "snacks",   emoji: "🍤" },

  // Hygiene
  { id: "h1", name: "Safeguard Bar",    price: 32,  cogs: 25,  stock: 20,  reorderQty: 5,  categoryId: "hygiene",  emoji: "🧼" },
  { id: "h2", name: "Colgate 50ml",     price: 28,  cogs: 22,  stock: 15,  reorderQty: 5,  categoryId: "hygiene",  emoji: "🪥" },
  { id: "h3", name: "Head & Shoulders", price: 45,  cogs: 36,  stock: 12,  reorderQty: 5,  categoryId: "hygiene",  emoji: "🧴" },

  // Eggs
  { id: "e1", name: "Egg (1pc)",        price: 9,   cogs: 7,   stock: 200, reorderQty: 30, categoryId: "eggs",     emoji: "🥚" },
  { id: "e2", name: "Egg (6pcs)",       price: 52,  cogs: 42,  stock: 50,  reorderQty: 10, categoryId: "eggs",     emoji: "🥚" },
  { id: "e3", name: "Egg (12pcs)",      price: 100, cogs: 82,  stock: 30,  reorderQty: 5,  categoryId: "eggs",     emoji: "🥚" },

  // Canned
  { id: "c1", name: "Lucky Me Soup",    price: 15,  cogs: 11,  stock: 60,  reorderQty: 15, categoryId: "canned",   emoji: "🍜" },
  { id: "c2", name: "555 Sardines",     price: 20,  cogs: 15,  stock: 40,  reorderQty: 10, categoryId: "canned",   emoji: "🐟" },
  { id: "c3", name: "Argentina Corned", price: 55,  cogs: 44,  stock: 20,  reorderQty: 5,  categoryId: "canned",   emoji: "🥩" },
  { id: "c4", name: "Ligo Sardines",    price: 22,  cogs: 16,  stock: 35,  reorderQty: 10, categoryId: "canned",   emoji: "🐟" },

  // Cleaning
  { id: "cl1", name: "Surf 65g",        price: 15,  cogs: 11,  stock: 30,  reorderQty: 8,  categoryId: "cleaning", emoji: "🧺" },
  { id: "cl2", name: "Joy Dishwash",    price: 30,  cogs: 23,  stock: 15,  reorderQty: 5,  categoryId: "cleaning", emoji: "🍽️" },
  { id: "cl3", name: "Mr. Muscle",      price: 85,  cogs: 68,  stock: 10,  reorderQty: 3,  categoryId: "cleaning", emoji: "🧹" },
];
