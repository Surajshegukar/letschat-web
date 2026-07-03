import React from "react";
import { CheckCircle2 } from "lucide-react";

interface PresetImage {
  name: string;
  url: string;
}

interface StatusImageCreatorProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  caption: string;
  setCaption: (caption: string) => void;
  activePreset: number | null;
  setActivePreset: (index: number | null) => void;
  presetImages: PresetImage[];
  handleSelectPreset: (url: string, index: number) => void;
}

export function StatusImageCreator({
  imageUrl,
  setImageUrl,
  caption,
  setCaption,
  activePreset,
  setActivePreset,
  presetImages,
  handleSelectPreset,
}: StatusImageCreatorProps) {
  return (
    <div className="space-y-5">
      {/* Preset Images Gallery */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-2 uppercase tracking-wide">
          Select A Preset Image
        </label>
        <div className="grid grid-cols-5 gap-2">
          {presetImages.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset.url, idx)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                activePreset === idx
                  ? "border-emerald-500 shadow-md scale-[0.98]"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                <span className="text-[9px] font-bold text-white leading-none truncate w-full">
                  {preset.name}
                </span>
              </div>
              {activePreset === idx && (
                <div className="absolute top-1 right-1 text-emerald-500">
                  <CheckCircle2 className="h-4.5 w-4.5 fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Or Custom URL Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Or Paste Custom Image URL
          </label>
          {imageUrl && (
            <button 
              onClick={() => { setImageUrl(""); setActivePreset(null); }} 
              className="text-[10px] text-zinc-450 hover:text-rose-500 font-bold uppercase transition"
            >
              Clear
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setActivePreset(null);
          }}
          className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#19E68C] focus:border-transparent transition-all"
        />
      </div>

      {/* Preview Box */}
      {imageUrl && (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center group shadow-sm">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=600";
            }}
          />
          {caption && (
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-4 py-3 text-white text-center text-sm font-semibold">
              {caption}
            </div>
          )}
        </div>
      )}

      {/* Caption Input */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block">
          Caption
        </label>
        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#19E68C] focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

export default StatusImageCreator;
