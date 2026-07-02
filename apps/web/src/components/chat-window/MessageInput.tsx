import React from "react";
import { Paperclip, Smile, Send } from "lucide-react";

interface MessageInputProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
}

export function MessageInput({ inputText, onChangeInput, onSendMessage }: MessageInputProps) {
  return (
    <div className="p-2 sm:p-2 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0">
      <form onSubmit={onSendMessage} className="flex items-center gap-3">
        <button
          type="button"
          className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-400"
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

        <button
          type="submit"
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#10B981] to-[#19E68C] text-zinc-955 shadow-md shadow-[#19E68C]/15 active:scale-[0.98] transition font-bold"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
