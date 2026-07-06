import React from "react";
import { Search } from "lucide-react";
import { EMOJI_CATEGORIES } from "@/constants/emoji-data";

interface EmojiPickerProps {
  trayRef: React.RefObject<HTMLDivElement | null>;
  filteredEmojis: string[];
  activeCategory: string;
  emojiSearch: string;
  onCategoryChange: (name: string) => void;
  onSearchChange: (q: string) => void;
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({
  trayRef,
  filteredEmojis,
  activeCategory,
  emojiSearch,
  onCategoryChange,
  onSearchChange,
  onEmojiSelect,
}: EmojiPickerProps) {
  return (
    <div
      ref={trayRef}
      className="absolute bottom-16 right-4 w-72 sm:w-80 h-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden text-left"
    >
      <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={emojiSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-7.5 bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-950 dark:border-zinc-800 outline-none rounded-lg pl-8 pr-3 text-xs dark:text-zinc-200 focus:border-[#19E68C]"
          />
        </div>
      </div>

      {!emojiSearch.trim() && (
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-2.5 bg-zinc-50/50 dark:bg-zinc-900/50">
          {EMOJI_CATEGORIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => onCategoryChange(c.name)}
              className={`py-2 px-3 text-[10px] font-bold border-b-2 transition-all ${
                activeCategory === c.name
                  ? "border-[#19E68C] text-emerald-600 dark:text-[#19E68C]"
                  : "border-transparent text-zinc-400 hover:text-zinc-550 dark:hover:text-zinc-300"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onEmojiSelect(emoji)}
                className="h-8.5 w-8.5 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg active:scale-90 transition-all duration-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400">
            No matching emojis found.
          </div>
        )}
      </div>
    </div>
  );
}
