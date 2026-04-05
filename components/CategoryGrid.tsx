"use client";
import { Category } from "@/types";

interface Props {
  categories: Category[];
  onSelect: (category: Category) => void;
  activeId: string | null;
}

export default function CategoryGrid({ categories, onSelect, activeId }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat)}
          className={`
            flex flex-col items-center justify-center gap-2
            rounded-2xl p-5 text-center font-semibold text-lg
            transition-all active:scale-95 select-none
            ${activeId === cat.id
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
              : "bg-white text-gray-700 shadow-md hover:bg-emerald-50 border border-gray-100"
            }
          `}
        >
          <span className="text-4xl">{cat.emoji}</span>
          <span className="text-sm font-bold">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
