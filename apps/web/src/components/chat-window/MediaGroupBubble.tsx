"use client";

import React, { useMemo } from "react";
import { Play, CheckCheck, Check } from "lucide-react";
import { Message } from "@/types/chat";
import { MediaGroup } from "@/types/ui";
import { useMessageActions } from "@/hooks/use-message-actions";
import { ReactionsBadge } from "./message-bubble/ReactionsBadge";
import { HoverActions } from "./message-bubble/HoverActions";

interface MediaGroupBubbleProps {
  group: MediaGroup;
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

function MediaGrid({ items, reactions, isMe }: { items: Message[]; reactions: { emoji: string; userIds: string[] }[]; isMe: boolean }) {
  const handleClick = (url?: string) => { if (url) window.open(url, "_blank"); };
  const len = items.length;
  const gridClass = "rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 relative w-[280px] sm:w-[320px]";

  if (len === 2) {
    return (
      <div className={`grid grid-cols-2 gap-1.5 aspect-[1.3/1] ${gridClass}`}>
        {items.map((msg) => <MediaItem key={msg.id} msg={msg} onClick={() => handleClick(msg.attachment!.url)} />)}
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  if (len === 3) {
    return (
      <div className={`grid grid-cols-3 gap-1.5 aspect-[2/1] ${gridClass}`}>
        {items.map((msg) => <MediaItem key={msg.id} msg={msg} onClick={() => handleClick(msg.attachment!.url)} />)}
        <ReactionsBadge reactions={reactions} isMe={isMe} />
      </div>
    );
  }

  const displayItems = items.slice(0, 4);
  const remainingCount = len - 3;

  return (
    <div className={`grid grid-cols-2 grid-rows-2 gap-1.5 aspect-square ${gridClass}`}>
      {displayItems.map((msg, index) => (
        <div key={msg.id} className="relative h-full w-full" onClick={() => handleClick(msg.attachment!.url)}>
          <MediaItem msg={msg} onClick={() => handleClick(msg.attachment!.url)} />
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

export function MediaGroupBubble({ group }: MediaGroupBubbleProps) {
  const isMe = group.senderId === "me";
  const primaryMessage = group.items[0]!;

  const { showReactionPicker, setShowReactionPicker, handleReply, handleReact } =
    useMessageActions(primaryMessage);

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

  return (
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
        <span className="text-[10px] text-zinc-450">{group.timestamp}</span>
      </div>

      <div className="flex items-center animate-fadeIn">
        <MediaGrid items={group.items} reactions={aggregatedReactions} isMe={isMe} />
        <HoverActions
          isMe={isMe}
          showReactionPicker={showReactionPicker}
          onToggleReactionPicker={(e) => { e.stopPropagation(); setShowReactionPicker((p) => !p); }}
          onReact={handleReact}
          onReply={handleReply}
        />
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
  );
}

export default MediaGroupBubble;
