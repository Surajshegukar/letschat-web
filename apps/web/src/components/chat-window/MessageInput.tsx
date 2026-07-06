import React from "react";
import { Paperclip, Smile, Send, Mic } from "lucide-react";
import { useMessageInput } from "@/hooks/use-message-input";
import { EmojiPicker } from "./message-input/EmojiPicker";
import { AttachmentMenu } from "./message-input/AttachmentMenu";
import { RecordingBar } from "./message-input/RecordingBar";
import { ReplyPreview } from "./message-input/ReplyPreview";
import { FileErrorBanner } from "./message-input/FileErrorBanner";

interface MessageInputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  onSendVoiceNote?: (duration: string) => void;
  onSendAttachment?: (type: "image" | "document") => void;
  onSendFiles?: (files: File[]) => void;
}

export function MessageInput({
  inputText,
  onChangeInput,
  onSendMessage,
  onSendVoiceNote,
  onSendFiles,
}: MessageInputProps) {
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
    inputRef,
    emojiTrayRef,
    photoInputRef,
    docInputRef,
    replyingToMessage,
    setReplyingToMessage,
    filteredEmojis,
    handlePhotoClick,
    handleDocClick,
    handleFileChange,
    handleStartRecording,
    handleCancelRecording,
    handleSendVoiceNote,
    formatRecordTime,
    handleEmojiSelect,
  } = useMessageInput({ inputText, onChangeInput, onSendVoiceNote, onSendFiles });

  return (
    <div className="p-2 sm:p-2 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 relative">
      {fileError && <FileErrorBanner error={fileError} onDismiss={() => setFileError(null)} />}
      {replyingToMessage && (
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
        <form onSubmit={onSendMessage} className="flex items-center gap-3">
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
            placeholder="Type a message..."
            className="flex-1 h-12 bg-[#FAFAFC] border border-zinc-300/50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-150 outline-none rounded-xl px-4 text-xs sm:text-sm focus:border-[#19E68C]"
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
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#10B981] to-[#19E68C] text-zinc-955 shadow-md shadow-[#19E68C]/15 active:scale-[0.98] transition font-bold"
            >
              <Send className="h-5 w-5" />
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
