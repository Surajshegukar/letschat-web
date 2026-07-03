import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Smile, Send, Mic, Trash2, Check, FileText, Image as ImageIcon } from "lucide-react";

interface MessageInputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  onSendVoiceNote?: (duration: string) => void;
  onSendAttachment?: (type: "image" | "document") => void;
}

export function MessageInput({
  inputText,
  onChangeInput,
  onSendMessage,
  onSendVoiceNote,
  onSendAttachment,
}: MessageInputProps) {
  // Voice Recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Attachment menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsMenuOpen(false);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleSendVoiceNote = () => {
    if (onSendVoiceNote) {
      const minutes = Math.floor(recordingSeconds / 60);
      const seconds = recordingSeconds % 60;
      const formatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      onSendVoiceNote(formatted === "0:00" ? "0:02" : formatted);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const formatRecordTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const handleAttachmentClick = (type: "image" | "document") => {
    if (onSendAttachment) {
      onSendAttachment(type);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="p-2 sm:p-2 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 relative">
      {/* Attachment popover menu */}
      {isMenuOpen && (
        <div className="absolute bottom-16 left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl shadow-xl z-20 space-y-1 w-44">
          <button
            onClick={() => handleAttachmentClick("image")}
            className="w-full flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-left text-xs font-bold text-slate-700 dark:text-zinc-300"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#19E68C]">
              <ImageIcon className="h-4 w-4" />
            </div>
            <span>Send Photo</span>
          </button>
          <button
            onClick={() => handleAttachmentClick("document")}
            className="w-full flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-left text-xs font-bold text-slate-700 dark:text-zinc-300"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#19E68C]">
              <FileText className="h-4 w-4" />
            </div>
            <span>Send PDF</span>
          </button>
        </div>
      )}

      {isRecording ? (
        /* Active Recording Simulation panel */
        <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-red-200/30 dark:border-zinc-800/40 animate-pulse w-full">
          <div className="flex items-center gap-2.5 pl-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-455">
              Recording Voice Note ({formatRecordTime(recordingSeconds)})
            </span>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <button
              type="button"
              onClick={handleCancelRecording}
              className="p-2 hover:bg-red-100 dark:hover:bg-zinc-800 text-rose-500 hover:text-rose-600 rounded-lg transition"
              title="Cancel Recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="h-8.5 w-8.5 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-[#19E68C] text-[#09090B] rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition"
              title="Send Voice Note"
            >
              <Check className="h-4.5 w-4.5 font-bold" />
            </button>
          </div>
        </div>
      ) : (
        /* Standard message form input */
        <form onSubmit={onSendMessage} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`p-2.5 rounded-xl transition text-zinc-400 ${
              isMenuOpen ? "bg-zinc-100 dark:bg-zinc-900 text-slate-800 dark:text-[#19E68C]" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => onChangeInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-12 bg-[#FAFAFC] border border-zinc-300/50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-150 outline-none rounded-xl px-4 text-xs sm:text-sm focus:border-[#19E68C]"
          />

          <button
            type="button"
            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-400"
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
