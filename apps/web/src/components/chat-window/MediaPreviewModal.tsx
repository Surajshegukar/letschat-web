"use client";

import React, { useState } from "react";
import { X, Send, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { PendingFile } from "@/hooks/use-message-input";

interface MediaPreviewModalProps {
  files: PendingFile[];
  onUpdateCaption: (index: number, caption: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export function MediaPreviewModal({ files, onUpdateCaption, onSend, onCancel }: MediaPreviewModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = files[activeIndex]!;
  const isImage = current.file.type.startsWith("image/");
  const isVideo = current.file.type.startsWith("video/");
  const isDoc = !isImage && !isVideo;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-xl transition text-white">
          <X className="h-5 w-5" />
        </button>
        <span className="text-white text-sm font-semibold">
          {files.length > 1 ? `${activeIndex + 1} / ${files.length}` : "Preview"}
        </span>
        <div className="w-9" />
      </div>

      {/* Main preview area */}
      <div className="flex-1 flex items-center justify-center relative px-4 min-h-0">
        {/* Prev */}
        {files.length > 1 && activeIndex > 0 && (
          <button
            onClick={() => setActiveIndex((i) => i - 1)}
            className="absolute left-2 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="max-w-lg w-full max-h-full flex items-center justify-center">
          {isImage && (
            <img
              src={current.previewUrl}
              alt="Preview"
              className="max-w-full max-h-[55vh] rounded-2xl object-contain shadow-2xl"
            />
          )}
          {isVideo && (
            <video
              src={current.previewUrl}
              controls
              className="max-w-full max-h-[55vh] rounded-2xl shadow-2xl"
            />
          )}
          {isDoc && (
            <div className="flex flex-col items-center gap-4 p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
              <div className="p-4 bg-emerald-500/10 rounded-2xl">
                <FileText className="h-12 w-12 text-[#19E68C]" />
              </div>
              <p className="text-white font-bold text-sm text-center break-all">{current.file.name}</p>
              <p className="text-zinc-400 text-xs">{(current.file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>

        {/* Next */}
        {files.length > 1 && activeIndex < files.length - 1 && (
          <button
            onClick={() => setActiveIndex((i) => i + 1)}
            className="absolute right-2 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {files.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 flex-shrink-0">
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-12 w-12 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                i === activeIndex ? "border-[#19E68C] scale-110" : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              {f.file.type.startsWith("image/") ? (
                <img src={f.previewUrl} className="w-full h-full object-cover" alt="" />
              ) : f.file.type.startsWith("video/") ? (
                <video src={f.previewUrl} className="w-full h-full object-cover" muted />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-zinc-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Caption input + Send */}
      <div className="px-4 pb-6 pt-2 flex items-center gap-3 flex-shrink-0">
        <input
          type="text"
          value={current.caption}
          onChange={(e) => onUpdateCaption(activeIndex, e.target.value)}
          placeholder="Add a caption..."
          className="flex-1 h-11 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 text-sm outline-none focus:border-[#19E68C] transition"
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
        />
        <button
          onClick={onSend}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#10B981] to-[#19E68C] text-[#09090B] shadow-lg shadow-[#19E68C]/20 active:scale-95 transition"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
