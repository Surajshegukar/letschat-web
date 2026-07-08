import React from "react";
import { Download, FileText, Play } from "lucide-react";
import { Attachment } from "@/types/chat";
import { AudioPlayBubble } from "../AudioPlayBubble";
import { ReactionsBadge } from "./ReactionsBadge";

interface AttachmentBubbleProps {
  attachment: Attachment;
  messageId: string;
  isMe: boolean;
  senderAvatar?: string;
  senderName?: string;
  content?: string;
  reactions: { emoji: string; userIds: string[] }[];
  onOpenGallery?: () => void;
}

export function AttachmentBubble({
  attachment,
  messageId,
  isMe,
  senderAvatar,
  senderName,
  content,
  reactions,
  onOpenGallery,
}: AttachmentBubbleProps) {
  const type = (attachment.type || "document") as string;

  if (type === "audio") {
    return (
      <div id={`msg-card-${messageId}`} className="relative transition-all duration-350 rounded-2xl">
        <AudioPlayBubble
          duration={attachment.size}
          senderAvatar={senderAvatar}
          senderName={senderName}
          isMe={isMe}
          url={attachment.url}
        />
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div
        id={`msg-card-${messageId}`}
        className="relative w-[280px] sm:w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-2.5 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden text-left transition-all duration-300 cursor-pointer"
        onClick={onOpenGallery}
      >
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800">
          <video src={attachment.url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
        {content && <p className="text-xs text-slate-700 dark:text-zinc-350 mt-2 px-1 font-semibold leading-relaxed">{content}</p>}
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  if (type === "image") {
    const imageUrl = attachment.url || "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600";
    const isGif = attachment.name?.endsWith(".gif") || imageUrl.includes(".gif");
    return (
      <div
        id={`msg-card-${messageId}`}
        className="relative w-[280px] sm:w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-2.5 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden text-left transition-all duration-300 cursor-pointer"
        onClick={onOpenGallery}
      >
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800">
          <img src={imageUrl} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="Attachment Preview" />
          {isGif && (
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-[2px] rounded-md text-[9px] text-white font-extrabold uppercase tracking-wider">
              GIF
            </span>
          )}
        </div>
        {content && <p className="text-xs text-slate-700 dark:text-zinc-350 mt-2 px-1 font-semibold leading-relaxed">{content}</p>}
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  // Document
  return (
    <div id={`msg-card-${messageId}`} className="relative w-[280px] sm:w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-3 dark:border-zinc-800 dark:bg-zinc-900 text-left transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-emerald-500/10 dark:bg-emerald-950/20 text-[#19E68C] rounded-xl flex-shrink-0">
            <FileText className="h-7 w-7" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">{attachment.name}</p>
            <p className="text-[9px] text-zinc-450 leading-none mt-1">{attachment.size}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition text-zinc-500 flex-shrink-0">
          <Download className="h-4 w-4" />
        </button>
      </div>
      <ReactionsBadge reactions={reactions} isMe={isMe} />
    </div>
  );
}
