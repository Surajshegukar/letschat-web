"use client";

import React, { useMemo, useState } from "react";
import { Play, CheckCheck, Check, Star } from "lucide-react";
import { Message } from "@/types/chat";
import { MediaGroup } from "@/types/ui";
import { useMessageActions } from "@/hooks/use-message-actions";
import { ReactionsBadge } from "./message-bubble/ReactionsBadge";
import { HoverActions } from "./message-bubble/HoverActions";
import { LightGallery, LightGalleryItem } from "./LightGallery";
import { useStarMessage } from "@/hooks/api/use-conversations";
import { useChatStore } from "@/store/chat-store";

interface MediaGroupBubbleProps {
  group: MediaGroup;
  isSelectionMode?: boolean;
  selectedMessageIds?: Set<string>;
  onToggleSelectMessage?: (messageId: string) => void;
}

function MediaItem({ msg, onClick }: { msg: Message; onClick: () => void }) {
  const isVideo = (msg.attachment!.type as string) === "video";
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer hover:opacity-90 active:scale-98 transition duration-150 h-full w-full"
    >
      {isVideo ? (
        <div className="h-full w-full relative">
          <video src={msg.attachment!.url} muted className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Play className="h-7 w-7 text-white fill-white/20" />
          </div>
        </div>
      ) : (
        <img src={msg.attachment!.url} className="w-full h-full object-cover" alt="Group Media" />
      )}
    </div>
  );
}

function MediaGrid({ items, reactions, isMe, onItemClick }: { items: Message[]; reactions: { emoji: string; userIds: string[] }[]; isMe: boolean; onItemClick: (index: number) => void }) {
  const len = items.length;
  const gridClass = "rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 relative w-[280px] sm:w-[320px]";

  if (len === 2) {
    return (
      <div className={`grid grid-cols-2 gap-1.5 aspect-[1.3/1] ${gridClass}`}>
        {items.map((msg, i) => <MediaItem key={msg.id || i} msg={msg} onClick={() => onItemClick(i)} />)}
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  if (len === 3) {
    return (
      <div className={`grid grid-cols-3 gap-1.5 aspect-[2/1] ${gridClass}`}>
        {items.map((msg, i) => <MediaItem key={msg.id || i} msg={msg} onClick={() => onItemClick(i)} />)}
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  const displayItems = items.slice(0, 4);
  const remainingCount = len - 3;

  return (
    <div className={`grid grid-cols-2 grid-rows-2 gap-1.5 aspect-square ${gridClass}`}>
      {displayItems.map((msg, index) => (
        <div key={msg.id || index} className="relative h-full w-full" onClick={() => onItemClick(index)}>
          <MediaItem msg={msg} onClick={() => onItemClick(index)} />
          {index === 3 && remainingCount > 1 && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center text-white font-extrabold text-xl font-sans tracking-wide">
              +{remainingCount}
            </div>
          )}
        </div>
      ))}
      <ReactionsBadge reactions={reactions} isMe={isMe} />
    </div>
  );
}

export function MediaGroupBubble({
  group,
  isSelectionMode = false,
  selectedMessageIds = new Set(),
  onToggleSelectMessage,
}: MediaGroupBubbleProps) {
  const isMe = group.senderId === "me";
  const primaryMessage = group.items[0]!;
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const starMutation = useStarMessage();

  const handleStar = () => {
    if (activeRoomId) {
      starMutation.mutate({ conversationId: activeRoomId, messageId: primaryMessage.id });
    }
  };

  const { showReactionPicker, setShowReactionPicker, canEditOrDelete, handleReply, handleReact, handleEdit, handleDelete } =
    useMessageActions(primaryMessage);

  const galleryItems: LightGalleryItem[] = group.items
    .filter((msg) => msg.attachment?.url)
    .map((msg) => ({
      url: msg.attachment!.url!,
      type: msg.attachment!.type as "image" | "video",
      caption: msg.content || undefined,
      message: msg,
    }));

  const aggregatedReactions = useMemo(() => {
    const list: { emoji: string; userIds: string[] }[] = [];
    group.items.forEach((msg) => {
      msg.reactions?.forEach((r) => {
        const existing = list.find((el) => el.emoji === r.emoji);
        if (existing) {
          r.userIds.forEach((id) => { if (!existing.userIds.includes(id)) existing.userIds.push(id); });
        } else {
          list.push({ emoji: r.emoji, userIds: [...r.userIds] });
        }
      });
    });
    return list;
  }, [group.items]);

  const isSelected = selectedMessageIds.has(group.id);

  const wrapWithSelection = (element: React.ReactNode) => {
    if (!isSelectionMode) return element;
    return (
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
          onToggleSelectMessage?.(group.id);
        }}
        className={`flex items-center gap-4 px-4 py-1.5 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 rounded-2xl cursor-pointer select-none transition-all duration-200 w-full ${
          isSelected ? "bg-emerald-500/5 dark:bg-[#19E68C]/5" : ""
        }`}
      >
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelectMessage?.(group.id)}
            className="h-4.5 w-4.5 rounded-full text-emerald-500 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
          />
        </div>
        <div className="flex-grow min-w-0">{element}</div>
      </div>
    );
  };

  return (
    <>
      {wrapWithSelection(
        <div
          className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative mb-3`}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {!isMe && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100 font-sans">
                {group.senderName}
              </span>
            )}
            <span className="text-[10px] text-zinc-450 flex items-center gap-1">
              {group.timestamp}
              {primaryMessage.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
            </span>
          </div>

          <div className="flex items-center animate-fadeIn">
            <MediaGrid
              items={group.items}
              reactions={aggregatedReactions}
              isMe={isMe}
              onItemClick={(i) => setGalleryIndex(i)}
            />
            {!isSelectionMode && (
              <HoverActions
                isMe={isMe}
                canEditOrDelete={canEditOrDelete}
                showReactionPicker={showReactionPicker}
                onToggleReactionPicker={(e) => { e.stopPropagation(); setShowReactionPicker((p) => !p); }}
                onReact={handleReact}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStar={handleStar}
                isStarred={primaryMessage.isStarred}
              />
            )}
          </div>

          {isMe && (
            <div className="mt-1 flex justify-end">
              {group.status === "read" ? (
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-[#19E68C]" />
              ) : group.status === "delivered" ? (
                <CheckCheck className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550" />
              ) : (
                <Check className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550" />
              )}
            </div>
          )}
        </div>
      )}

      {galleryIndex !== null && galleryItems.length > 0 && (
        <LightGallery
          items={galleryItems}
          initialIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
          onReply={(msg) => handleReply()}
          onEdit={(msg) => handleEdit()}
          onDelete={(msg) => handleDelete()}
        />
      )}
    </>
  );
}

export default MediaGroupBubble;
