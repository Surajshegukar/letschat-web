import React from "react";
import { Search, Phone, Video, Info, ArrowLeft, X, MoreVertical, CheckSquare, Eraser, Trash2 } from "lucide-react";
import { Avatar } from "../ui";

interface ChatHeaderProps {
  roomName: string;
  avatarUrl?: string;
  isGroup?: boolean;
  isOnline?: boolean;
  memberCount?: number;
  isRemoved?: boolean;
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
  onBack?: () => void;
  isSearchingMessages: boolean;
  setIsSearchingMessages: (val: boolean) => void;
  messageSearchQuery: string;
  setMessageSearchQuery: (val: string) => void;
  onToggleSelectionMode: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
}

export function ChatHeader({
  roomName,
  avatarUrl,
  isGroup = false,
  isOnline = false,
  memberCount = 0,
  isRemoved = false,
  isDetailsOpen,
  onToggleDetails,
  onStartAudioCall,
  onStartVideoCall,
  onBack,
  isSearchingMessages,
  setIsSearchingMessages,
  messageSearchQuery,
  setMessageSearchQuery,
  onToggleSelectionMode,
  onClearChat,
  onDeleteChat,
}: ChatHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  if (isSearchingMessages) {
    return (
      <div className="h-16 md:h-20 px-4 md:px-8 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 flex-shrink-0 animate-fadeIn">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              setIsSearchingMessages(false);
              setMessageSearchQuery("");
            }}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-slate-800 dark:hover:text-white"
            title="Close search"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-200/50 dark:border-zinc-800/55 shadow-inner flex-grow">
            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search messages..."
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-550 focus:outline-none focus:ring-0 border-none p-0"
              autoFocus
            />
            {messageSearchQuery && (
              <button
                onClick={() => setMessageSearchQuery("")}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-16 md:h-20 px-4 md:px-8 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="relative">
          {isGroup ? (
            <div className="h-10 w-10 rounded-full bg-[#19E68C]/15 text-emerald-650 flex items-center justify-center font-bold text-sm dark:bg-[#19E68C]/10 dark:text-[#19E68C]">
              {roomName.charAt(0)}
            </div>
          ) : (
            <Avatar src={avatarUrl} name={roomName} size="md" />
          )}
          {isOnline && !isGroup && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
          )}
        </div>
        <div className="text-left">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-none">
            {roomName}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1.5 leading-none">
            {isGroup
              ? isRemoved
                ? "You were removed from this group"
                : `${memberCount} members`
              : isOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
        <button
          onClick={() => setIsSearchingMessages(true)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition hover:text-slate-800 dark:hover:text-white"
          title="Search messages"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleDetails}
          className={`p-2 rounded-xl transition ${
            isDetailsOpen
              ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Info className="h-5 w-5" />
        </button>

        {/* Drodown Options */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition hover:text-slate-800 dark:hover:text-white"
            title="Menu options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-2xl shadow-xl py-1.5 z-40 text-left animate-fadeIn">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onToggleSelectionMode();
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2.5 transition"
                >
                  <CheckSquare className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  Select Chat
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onClearChat();
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center gap-2.5 transition"
                >
                  <Eraser className="h-4 w-4 text-amber-500" />
                  Clear Chat
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onDeleteChat();
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 flex items-center gap-2.5 transition"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  Delete Chat
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default ChatHeader;
