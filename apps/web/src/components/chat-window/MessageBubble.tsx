"use client";

import React, { useState } from "react";
import { CheckCheck, Check, Pencil } from "lucide-react";
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
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.senderId === "me";
  const reactions = message.reactions ?? [];
  const [galleryOpen, setGalleryOpen] = useState(false);

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
    />
  );

  const meta = (
    <div className="flex items-center gap-2 mb-1">
      {!isMe && (
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100 font-sans">
          {message.senderName}
        </span>
      )}
      <span className="text-[10px] text-zinc-450">{message.timestamp}</span>
      {message.isEdited && !message.isDeleted && (
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 flex items-center gap-0.5">
          <Pencil className="h-2.5 w-2.5" /> edited
        </span>
      )}
    </div>
  );

  // Deleted message — render a minimal tombstone, no actions
  if (message.isDeleted) {
    return (
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
              content={message.content}
              reactions={reactions}
              onOpenGallery={isMediaAttachment ? () => setGalleryOpen(true) : undefined}
            />
            {hoverActions}
          </div>
        </div>

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
          <span className="break-words">{message.content}</span>
          <ReactionsBadge reactions={reactions} isMe={isMe} />
        </div>
        {hoverActions}
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
    </div>
  );
}

export default MessageBubble;
