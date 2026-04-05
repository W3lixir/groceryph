"use client";
import { useEffect, useState } from "react";
import { Category } from "@/types";
import { generateId } from "@/lib/store";

interface Props {
  category?: Category | null;
  onSave: (cat: Category) => void;
  onClose: () => void;
}

const EMOJI_GROUPS = [
  { label: "Drinks",      emojis: ["🥤","💧","🍵","🥛","🍫","🧃","🍺","🧋"] },
  { label: "Food",        emojis: ["🍞","🍚","🥖","🫓","🍜","🍗","🥩","🐟","🥚","🧀","🍕","🥕","🥦","🧅","🍎"] },
  { label: "Snacks",      emojis: ["🍬","🍿","🍖","🥔","🍤","🍦","🍰","🎂","🍫","🍭"] },
  { label: "Hygiene",     emojis: ["🧴","🧼","🪥","🧻","🪒","💄","🧽"] },
  { label: "Cleaning",    emojis: ["🧹","🧺","🪣","🫧","🪠"] },
  { label: "Canned",      emojis: ["🥫","🫙","🐟","🥩","🍅"] },
  { label: "Smoke",       emojis: ["🚬","🪔","💨","🔥"] },
  { label: "Ice",         emojis: ["🧊","❄️","🥶","🍧"] },
  { label: "OTC / Meds",  emojis: ["💊","🩺","🧪","💉","🩹","🏥"] },
  { label: "Condiments",  emojis: ["🧂","🫙","🍯","🫒","🌶️","🧄","🍶"] },
  { label: "Others",      emojis: ["📦","🛒","❓","🔧","🪙","📋","🎁","🪝"] },
];

export default function CategoryFormModal({ category, onSave, onClose }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setEmoji(category.emoji);
    } else {
      setName("");
      setEmoji("📦");
    }
  }, [category]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: category?.id ?? generateId(), name: name.trim(), emoji });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-emerald-500 text-white px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{category ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="text-emerald-200 hover:text-white text-2xl font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Icon</p>
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="text-4xl w-16 h-16 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:border-emerald-400 flex items-center justify-center transition-all"
            >
              {emoji}
            </button>
            {showEmojiPicker && (
              <div className="mt-2 bg-gray-50 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label} className="px-3 pt-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{group.label}</p>
                    <div className="flex flex-wrap gap-1 pb-2 border-b border-gray-100 last:border-0">
                      {group.emojis.map((e) => (
                        <button
                          key={group.label + e}
                          onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                          className="text-2xl w-10 h-10 rounded-xl hover:bg-emerald-100 active:scale-90 transition-all"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-1">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drinks"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={onClose} className="py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 active:scale-95 transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-emerald-200"
            >
              {category ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
