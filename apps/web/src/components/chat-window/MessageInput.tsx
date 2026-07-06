import React from "react";
import { Paperclip, Smile, Send, Mic, Pencil, X } from "lucide-react";
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
  onSendVoiceNote?: (duration: string) => void;
  onSendAttachment?: (type: "image" | "document") => void;
  onSendFiles?: (files: File[], captions: string[]) => void;
}

export function MessageInput({
  inputText,
  onChangeInput,
  onSendMessage,
  onSendVoiceNote,
  onSendFiles,
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

  return (
    <div className="p-2 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 relative">
      {fileError && <FileErrorBanner error={fileError} onDismiss={() => setFileError(null)} />}

      {/* Edit mode banner */}
      {editingMessage && (
        <div className="mx-2 mb-2 p-3 bg-zinc-50 dark:bg-zinc-900 border-l-4 border-[#19E68C] rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-[#19E68C] block uppercase tracking-wider flex items-center gap-1">
              <Pencil className="h-3 w-3" /> Editing message
            </span>
            <p className="text-xs text-zinc-650 dark:text-zinc-300 truncate mt-1">{editingMessage.content}</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingMessage(null); onChangeInput(""); }}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 transition flex-shrink-0 ml-4"
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
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setIsMenuOpen((p) => !p); setIsEmojiOpen(false); }}
            className={`p-2.5 rounded-xl transition text-zinc-400 ${isMenuOpen ? "bg-zinc-100 dark:bg-zinc-900 text-slate-800 dark:text-[#19E68C]" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => onChangeInput(e.target.value)}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            className={`flex-1 h-12 bg-[#FAFAFC] border dark:bg-zinc-900 dark:text-zinc-150 outline-none rounded-xl px-4 text-xs sm:text-sm focus:border-[#19E68C] transition ${
              editingMessage ? "border-[#19E68C]/50 dark:border-[#19E68C]/30" : "border-zinc-300/50 dark:border-zinc-800"
            }`}
          />

          <button
            type="button"
            onClick={() => { setIsEmojiOpen((p) => !p); setIsMenuOpen(false); }}
            className={`p-2.5 rounded-xl transition text-zinc-400 ${isEmojiOpen ? "bg-zinc-100 dark:bg-zinc-900 text-slate-800 dark:text-[#19E68C]" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Smile className="h-5 w-5" />
          </button>

          {inputText.trim() ? (
            <button
              type="submit"
              className={`h-11 w-11 flex items-center justify-center rounded-xl shadow-md active:scale-[0.98] transition font-bold ${
                editingMessage
                  ? "bg-[#19E68C] text-[#09090B] shadow-[#19E68C]/20"
                  : "bg-gradient-to-r from-[#10B981] to-[#19E68C] text-zinc-955 shadow-[#19E68C]/15"
              }`}
            >
              {editingMessage ? <Pencil className="h-4.5 w-4.5" /> : <Send className="h-5 w-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-450 hover:text-emerald-500 dark:hover:text-[#19E68C] active:scale-[0.98] transition"
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
