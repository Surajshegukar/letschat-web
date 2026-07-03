import React from "react";
import { Paintbrush, FileText } from "lucide-react";

interface StatusTextCreatorProps {
  text: string;
  setText: (text: string) => void;
  activeGradient: string;
  activeFont: { name: string; class: string };
  cycleGradient: () => void;
  cycleFont: () => void;
}

export function StatusTextCreator({
  text,
  setText,
  activeGradient,
  activeFont,
  cycleGradient,
  cycleFont,
}: StatusTextCreatorProps) {
  return (
    <div className="space-y-4">
      {/* Canvas Preview Area */}
      <div
        className={`relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr ${activeGradient} flex items-center justify-center p-6 shadow-inner transition-all duration-300`}
      >
        <textarea
          placeholder="What's on your mind?..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 150))}
          className={`w-full max-h-[80%] bg-transparent border-none outline-none focus:ring-0 text-white text-center text-xl md:text-2xl font-bold placeholder-white/60 resize-none overflow-hidden ${activeFont.class}`}
          maxLength={150}
        />

        {/* Character limit overlay */}
        <span className="absolute bottom-3 right-4 text-[10px] text-white/70 font-semibold uppercase tracking-wider">
          {text.length} / 150
        </span>
      </div>

      {/* Formatting Controls */}
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-150/40 dark:border-zinc-800/40">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 pl-1">
          Customize Canvas
        </span>
        <div className="flex gap-2">
          {/* Gradient Selector Button */}
          <button
            onClick={cycleGradient}
            title="Change Background Color"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition text-zinc-650 dark:text-zinc-300 shadow-sm"
          >
            <Paintbrush className="h-4 w-4" />
          </button>

          {/* Font Selector Button */}
          <button
            onClick={cycleFont}
            title={`Change Font Style (${activeFont.name})`}
            className="h-10 px-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition text-zinc-650 dark:text-zinc-300 shadow-sm text-xs font-bold"
          >
            <FileText className="h-4 w-4" />
            <span>{activeFont.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusTextCreator;
