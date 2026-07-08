"use client";

import React, { useState } from "react";
import { CheckCheck, Check, Pencil, Star } from "lucide-react";
import { useStarMessage } from "@/hooks/api/use-conversations";
import { useChatStore } from "@/store/chat-store";
import { Message } from "@/types/chat";
import { useMessageActions } from "@/hooks/use-message-actions";
import { ReplyQuote } from "./message-bubble/ReplyQuote";
import { ReactionsBadge } from "./message-bubble/ReactionsBadge";
import { HoverActions } from "./message-bubble/HoverActions";
import { AttachmentBubble } from "./message-bubble/AttachmentBubble";
import { LightGallery, LightGalleryItem } from "./LightGallery";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface MessageBubbleProps {
  message: Message;
  highlightQuery?: string;
  isSelectionMode?: boolean;
  selectedMessageIds?: Set<string>;
  onToggleSelectMessage?: (messageId: string) => void;
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const renderHighlightedContent = (content: string, query: string) => {
  if (!query.trim() || !content) return <span className="break-words">{content}</span>;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = content.split(regex);

  return (
    <span className="break-words">
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-250 dark:bg-yellow-500/40 text-slate-900 dark:text-yellow-105 rounded px-0.5 font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export function MessageBubble({
  message,
  highlightQuery = "",
  isSelectionMode = false,
  selectedMessageIds = new Set(),
  onToggleSelectMessage,
}: MessageBubbleProps) {
  const isMe = message.senderId === "me";
  const reactions = message.reactions ?? [];
  const [galleryOpen, setGalleryOpen] = useState(false);

  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const starMutation = useStarMessage();

  const handleStar = () => {
    if (activeRoomId) {
      starMutation.mutate({ conversationId: activeRoomId, messageId: message.id });
    }
  };

  const {
    showReactionPicker,
    setShowReactionPicker,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    canEditOrDelete,
    handleReply,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleReact,
    handleScrollToReply,
  } = useMessageActions(message);

  const isMediaAttachment =
    message.attachment?.type === "image" || message.attachment?.type === "video";

  const galleryItems: LightGalleryItem[] = isMediaAttachment
    ? [{
        url: message.attachment!.url!,
        type: message.attachment!.type as "image" | "video",
        caption: message.content || undefined,
        message,
      }]
    : [];

  const hoverActions = (
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
      isStarred={message.isStarred}
    />
  );

  const meta = (
    <div className="flex items-center gap-2 mb-1">
      {!isMe && (
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100 font-sans">
          {message.senderName}
        </span>
      )}
      <span className="text-[10px] text-zinc-450 flex items-center gap-1">
        {message.timestamp}
        {message.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
      </span>
      {message.isEdited && !message.isDeleted && (
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 flex items-center gap-0.5">
          <Pencil className="h-2.5 w-2.5" /> edited
        </span>
      )}
    </div>
  );

  const isSelected = selectedMessageIds.has(message.id);

  const wrapWithSelection = (element: React.ReactNode) => {
    if (!isSelectionMode) return element;
    return (
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
          onToggleSelectMessage?.(message.id);
        }}
        className={`flex items-center gap-4 px-4 py-1.5 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 rounded-2xl cursor-pointer select-none transition-all duration-200 w-full ${
          isSelected ? "bg-emerald-500/5 dark:bg-[#19E68C]/5" : ""
        }`}
      >
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelectMessage?.(message.id)}
            className="h-4.5 w-4.5 rounded-full text-emerald-500 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
          />
        </div>
        <div className="flex-grow min-w-0">{element}</div>
      </div>
    );
  };

  // Deleted message — render a minimal tombstone, no actions
  if (message.isDeleted) {
    return wrapWithSelection(
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-2`}>
        {meta}
        <div className={`px-4 py-2.5 rounded-2xl text-xs shadow-sm italic text-zinc-400 dark:text-zinc-500 border border-dashed ${
          isMe ? "rounded-tr-none border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900" : "rounded-tl-none border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        }`}>
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  if (message.attachment) {
    return (
      <>
        {wrapWithSelection(
          <div
            className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative mb-2`}
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            {meta}
            <div className="flex items-center">
              <AttachmentBubble
                attachment={message.attachment}
                messageId={message.id}
                isMe={isMe}
                senderAvatar={message.senderAvatar}
                senderName={message.senderName}
                content={message.content}
                reactions={reactions}
                onOpenGallery={isMediaAttachment ? () => setGalleryOpen(true) : undefined}
              />
              {!isSelectionMode && hoverActions}
            </div>
          </div>
        )}

        {galleryOpen && galleryItems.length > 0 && (
          <LightGallery
            items={galleryItems}
            onClose={() => setGalleryOpen(false)}
            onReply={(msg) => handleReply()}
            onEdit={(msg) => handleEdit()}
            onDelete={(msg) => { setGalleryOpen(false); handleDelete(); }}
          />
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          isConfirming={isDeleting}
          title="Delete message"
          message="This message will be permanently deleted. This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </>
    );
  }

  return (
    <>
      {wrapWithSelection(
        <div
          className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative mb-2`}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {meta}
          <div className="flex items-center">
            <div
              id={`msg-card-${message.id}`}
              className={`relative max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm text-left transition-all duration-300 ${
                isMe
                  ? "bg-[#EAFDF5] text-emerald-955 rounded-tr-none dark:bg-zinc-800 dark:text-zinc-100"
                  : "bg-white text-slate-800 rounded-tl-none border border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-855"
              }`}
            >
              {message.replyTo && (
                <ReplyQuote replyTo={message.replyTo} onScrollToReply={handleScrollToReply} />
              )}
              {renderHighlightedContent(message.content, highlightQuery)}
              <ReactionsBadge reactions={reactions} isMe={isMe} />
            </div>
            {!isSelectionMode && hoverActions}
          </div>

          {isMe && (
            <div className="mt-1 flex justify-end">
              {message.status === "read" ? (
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-[#19E68C]" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550" />
              ) : (
                <Check className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550" />
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
        title="Delete message"
        message="This message will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}

export default MessageBubble;
