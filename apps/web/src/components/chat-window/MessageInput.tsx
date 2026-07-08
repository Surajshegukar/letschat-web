import React, { useEffect } from "react";
import { Plus, Smile, Send, Mic, Pencil, X } from "lucide-react";
import { useMessageInput } from "@/hooks/use-message-input";
import { useEditMessage } from "@/hooks/api/use-conversations";
import { useChatStore } from "@/store/chat-store";
import { EmojiPicker } from "./message-input/EmojiPicker";
import { AttachmentMenu } from "./message-input/AttachmentMenu";
import { RecordingBar } from "./message-input/RecordingBar";
import { ReplyPreview } from "./message-input/ReplyPreview";
import { FileErrorBanner } from "./message-input/FileErrorBanner";
import { MediaPreviewModal } from "./MediaPreviewModal";

interface MessageInputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  onSendVoiceNote?: (file: File, duration: string) => void;
  onSendAttachment?: (type: "image" | "document") => void;
  onSendFiles?: (files: File[], captions: string[]) => void;
  isBlocked?: boolean;
  hasBlockedMe?: boolean;
}

export function MessageInput({
  inputText,
  onChangeInput,
  onSendMessage,
  onSendVoiceNote,
  onSendFiles,
  isBlocked = false,
  hasBlockedMe = false,
}: MessageInputProps) {
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const editMutation = useEditMessage();

  const {
    isRecording,
    recordingSeconds,
    isMenuOpen,
    setIsMenuOpen,
    isEmojiOpen,
    setIsEmojiOpen,
    activeCategory,
    setActiveCategory,
    emojiSearch,
    setEmojiSearch,
    fileError,
    setFileError,
    pendingFiles,
    inputRef,
    emojiTrayRef,
    photoInputRef,
    docInputRef,
    replyingToMessage,
    setReplyingToMessage,
    editingMessage,
    setEditingMessage,
    filteredEmojis,
    handlePhotoClick,
    handleDocClick,
    handleFileChange,
    handleSendPendingFiles,
    handleCancelPendingFiles,
    handleUpdateCaption,
    handleStartRecording,
    handleCancelRecording,
    handleSendVoiceNote,
    formatRecordTime,
    handleEmojiSelect,
  } = useMessageInput({ inputText, onChangeInput, onSendVoiceNote, onSendFiles });

  // Auto-resize textarea whenever inputText changes (covers programmatic fills like edit mode)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [inputText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingMessage && activeRoomId && inputText.trim()) {
      editMutation.mutate(
        { conversationId: activeRoomId, messageId: editingMessage.id, content: inputText.trim() },
        { onSuccess: () => { setEditingMessage(null); onChangeInput(""); } }
      );
      return;
    }
    onSendMessage(e);
  };

  // Show media preview modal when files are staged
  if (pendingFiles.length > 0) {
    return (
      <MediaPreviewModal
        files={pendingFiles}
        onUpdateCaption={handleUpdateCaption}
        onSend={handleSendPendingFiles}
        onCancel={handleCancelPendingFiles}
      />
    );
  }

  if (isBlocked) {
    return (
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 flex items-center justify-center text-xs font-semibold text-red-500/80 dark:text-red-400 select-none">
        You have blocked this user. Unblock to send messages.
      </div>
    );
  }

  if (hasBlockedMe) {
    return (
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 flex items-center justify-center text-xs font-semibold text-zinc-500 select-none">
        You cannot send messages to this user.
      </div>
    );
  }

  return (
    <div className="p-3 bg-transparent flex-shrink-0 relative">
      {fileError && <FileErrorBanner error={fileError} onDismiss={() => setFileError(null)} />}

      {/* Edit mode banner */}
      {editingMessage && (
        <div className="mx-2 mb-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-1 border-[#19E68C] rounded-xl flex items-start justify-between gap-3 animate-fadeIn">
          <div className="min-w-0 flex-1 overflow-hidden">
            <span className="text-[10px] font-bold text-[#19E68C] block uppercase tracking-wider flex items-center gap-1 mb-1">
              <Pencil className="h-3 w-3" /> Editing message
            </span>
            <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed line-clamp-3 break-words">
              {editingMessage.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingMessage(null); onChangeInput(""); }}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-450 hover:text-zinc-600 transition flex-shrink-0 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {replyingToMessage && !editingMessage && (
        <ReplyPreview message={replyingToMessage} onDismiss={() => setReplyingToMessage(null)} />
      )}

      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
      <input ref={docInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.zip" onChange={handleFileChange} className="hidden" />

      {isMenuOpen && <AttachmentMenu onPhotoClick={handlePhotoClick} onDocClick={handleDocClick} />}
      {isEmojiOpen && (
        <EmojiPicker
          trayRef={emojiTrayRef}
          filteredEmojis={filteredEmojis}
          activeCategory={activeCategory}
          emojiSearch={emojiSearch}
          onCategoryChange={setActiveCategory}
          onSearchChange={setEmojiSearch}
          onEmojiSelect={handleEmojiSelect}
        />
      )}

      {isRecording ? (
        <RecordingBar
          recordingSeconds={recordingSeconds}
          formatRecordTime={formatRecordTime}
          onCancel={handleCancelRecording}
          onSend={handleSendVoiceNote}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-end bg-[#FAFAFC] dark:bg-zinc-900 border border-zinc-250/50 dark:border-zinc-800/80 rounded-2xl px-3 py-1.5 w-full transition-all"
        >
          <button
            type="button"
            onClick={() => { setIsMenuOpen((p) => !p); setIsEmojiOpen(false); }}
            className={`p-2 rounded-full transition text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-[#19E68C] flex-shrink-0 ${isMenuOpen ? "bg-zinc-100 dark:bg-zinc-800 text-[#19E68C]" : ""}`}
            title="Attach File"
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => { setIsEmojiOpen((p) => !p); setIsMenuOpen(false); }}
            className={`p-2 rounded-full transition text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-[#19E68C] flex-shrink-0 ${isEmojiOpen ? "bg-zinc-100 dark:bg-zinc-800 text-[#19E68C]" : ""}`}
            title="Emoji Picker"
          >
            <Smile className="h-5 w-5" />
          </button>

          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={1}
            value={inputText}
            onChange={(e) => {
              onChangeInput(e.target.value);
              // Auto-resize: reset height then expand
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs sm:text-sm px-2 py-1.5 resize-none overflow-y-auto scrollbar-none leading-relaxed"
            style={{ maxHeight: 140, minHeight: 36 }}
          />

          {inputText.trim() ? (
            <button
              type="submit"
              className="p-2 rounded-full transition active:scale-95 flex items-center justify-center text-emerald-500 dark:text-[#19E68C] hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 flex-shrink-0"
              title={editingMessage ? "Save Edit" : "Send Message"}
            >
              {editingMessage ? <Pencil className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              className="p-2 rounded-full transition active:scale-95 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C] hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 flex-shrink-0"
              title="Record Voice Note"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
}

export default MessageInput;
