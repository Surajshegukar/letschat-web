"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, CornerUpLeft, Pencil, Trash2, Download, Check } from "lucide-react";
import { Message } from "@/types/chat";
import { isWithinEditWindow } from "@/hooks/use-message-actions";
import { useEditMessage } from "@/hooks/api/use-conversations";
import { useChatStore } from "@/store/chat-store";

export interface LightGalleryItem {
  url: string;
  type: "image" | "video";
  caption?: string;
  message: Message;
}

interface LightGalleryProps {
  items: LightGalleryItem[];
  initialIndex?: number;
  onClose: () => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
}

export function LightGallery({
  items,
  initialIndex = 0,
  onClose,
  onReply,
  onEdit,
  onDelete,
}: LightGalleryProps) {
  const [index, setIndex] = useState(initialIndex);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const current = items[index]!;
  const isMe = current.message.senderId === "me";
  const canEditOrDelete = isMe && isWithinEditWindow(current.message.createdAt);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const editMutation = useEditMessage();

  const prev = useCallback(() => { setIndex((i) => Math.max(0, i - 1)); setEditingCaption(false); }, []);
  const next = useCallback(() => { setIndex((i) => Math.min(items.length - 1, i + 1)); setEditingCaption(false); }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (editingCaption) setEditingCaption(false); else onClose(); }
      if (!editingCaption && e.key === "ArrowLeft") prev();
      if (!editingCaption && e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, editingCaption]);

  const handleEditClick = () => {
    // For media messages, edit the caption inline; for text messages fall back to chat input
    if (current.message.attachment) {
      setCaptionDraft(current.message.content || "");
      setEditingCaption(true);
    } else {
      onEdit(current.message);
      onClose();
    }
  };

  const handleSaveCaption = () => {
    if (!activeRoomId) return;
    editMutation.mutate(
      { conversationId: activeRoomId, messageId: current.message.id, content: captionDraft },
      { onSuccess: () => setEditingCaption(false) }
    );
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = current.url;
    a.download = current.message.attachment?.name || "media";
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col select-none" onClick={onClose}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: sender info */}
        <div className="flex items-center gap-3 min-w-0">
          {current.message.senderAvatar && (
            <img src={current.message.senderAvatar} className="h-8 w-8 rounded-full object-cover flex-shrink-0" alt="" />
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-bold leading-none truncate">{current.message.senderName}</p>
            <p className="text-zinc-400 text-[10px] mt-0.5 leading-none">{current.message.timestamp}</p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { onReply(current.message); onClose(); }}
            className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-300 hover:text-white"
            title="Reply"
          >
            <CornerUpLeft className="h-[18px] w-[18px]" />
          </button>

          {canEditOrDelete && (
            <button
              onClick={handleEditClick}
              className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-300 hover:text-[#19E68C]"
              title="Edit caption"
            >
              <Pencil className="h-[18px] w-[18px]" />
            </button>
          )}

          {canEditOrDelete && (
            <button
              onClick={() => { onDelete(current.message); }}
              className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-300 hover:text-rose-400"
              title="Delete"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-300 hover:text-white"
            title="Download"
          >
            <Download className="h-[18px] w-[18px]" />
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-300 hover:text-white ml-1"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Media area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12" onClick={(e) => e.stopPropagation()}>
        {index > 0 && (
          <button
            onClick={prev}
            className="absolute left-2 p-2.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="max-w-4xl w-full max-h-full flex items-center justify-center">
          {current.type === "image" ? (
            <img
              src={current.url}
              alt={current.caption || ""}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              draggable={false}
            />
          ) : (
            <video
              src={current.url}
              controls
              autoPlay
              className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>

        {index < items.length - 1 && (
          <button
            onClick={next}
            className="absolute right-2 p-2.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Caption + counter */}
      <div className="px-6 py-4 flex-shrink-0 text-center" onClick={(e) => e.stopPropagation()}>
        {editingCaption ? (
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <input
              autoFocus
              type="text"
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveCaption(); }}
              placeholder="Add a caption..."
              className="flex-1 h-10 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 text-sm outline-none focus:border-[#19E68C] transition"
            />
            <button
              onClick={handleSaveCaption}
              disabled={editMutation.isPending}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#19E68C] text-[#09090B] transition active:scale-95 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setEditingCaption(false)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          current.caption && (
            <p className="text-white text-sm font-medium mb-2 leading-relaxed">{current.caption}</p>
          )
        )}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIndex(i); setEditingCaption(false); }}
                className={`rounded-full transition-all ${
                  i === index ? "w-4 h-1.5 bg-[#19E68C]" : "w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
