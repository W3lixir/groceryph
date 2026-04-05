"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Category } from "@/types";

interface Props {
  cat: Category;
  count: number;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SortableCategoryItem({ cat, count, isActive, onSelect, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative flex items-center">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none flex-shrink-0 px-1 py-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        tabIndex={-1}
      >
        ⠿
      </button>

      {/* Category button */}
      <button
        onClick={onSelect}
        className={`flex-1 text-left px-2 py-2 rounded-xl text-sm font-semibold transition-all pr-12 truncate ${
          isActive
            ? "bg-emerald-500 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {cat.emoji} {cat.name}
        <span className={`ml-1 text-xs ${isActive ? "text-emerald-100" : "text-gray-400"}`}>
          ({count})
        </span>
      </button>

      {/* Edit/Delete — show on hover */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
        <button
          onClick={onEdit}
          className="w-6 h-6 rounded-lg bg-white shadow text-gray-500 hover:text-emerald-600 text-xs flex items-center justify-center"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded-lg bg-white shadow text-gray-500 hover:text-red-500 text-xs flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
