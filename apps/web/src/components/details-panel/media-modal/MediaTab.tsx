import React from "react";
import { Play, Download } from "lucide-react";
import { mockMedia } from "@/constants/mock-data";

export function MediaTab() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {mockMedia.map((item) => (
        <div
          key={item.id}
          className="group relative aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/80 cursor-pointer shadow-sm hover:shadow-md transition"
        >
          <img
            src={item.url}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            alt={item.title}
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-3">
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition"
                title="Download file"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-left">
              {item.type === "video" && (
                <div className="mb-1.5 h-6 w-6 rounded-full bg-[#19E68C] flex items-center justify-center shadow">
                  <Play className="h-3 w-3 fill-black text-black ml-0.5" />
                </div>
              )}
              <p className="text-[10px] font-bold text-white truncate leading-tight">
                {item.title}
              </p>
            </div>
          </div>

          {/* Static play badge for video when not hovered */}
          {item.type === "video" && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 group-hover:opacity-0 transition">
              <Play className="h-2 w-2 fill-white text-white" />
              <span>Video</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export default MediaTab;
