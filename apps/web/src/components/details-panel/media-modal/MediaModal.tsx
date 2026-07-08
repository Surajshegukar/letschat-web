"use client";

import React from "react";
import { X } from "lucide-react";
import { useMediaModal } from "@/hooks/use-media-modal";
import { MediaTab } from "./MediaTab";
import { DocsTab } from "./DocsTab";
import { LinksTab } from "./LinksTab";
import { useChatStore } from "@/store/chat-store";
import { useMessages } from "@/hooks/api/use-conversations";
import { formatMessage, RawMessage } from "@/utils/chat-helpers";
import { useAuthStore } from "@/store/auth-store";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
}

export function MediaModal({ isOpen, onClose, roomName }: MediaModalProps) {
  const { activeTab, setActiveTab, copiedId, handleCopyLink } = useMediaModal(isOpen, onClose);

  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: messagesData } = useMessages(activeRoomId || null);

  const activeMessages = React.useMemo(() => {
    if (!messagesData || !currentUserId) return [];
    const allRawMessages = messagesData.pages.flatMap((page) => page.data.messages || []);
    return allRawMessages.map((msg: RawMessage) => formatMessage(msg, currentUserId)).reverse();
  }, [messagesData, currentUserId]);

  const mediaList = React.useMemo(() => {
    return activeMessages
      .filter((msg) => msg.attachment && (msg.attachment.type === "image" || msg.attachment.type === "video") && !msg.isDeleted)
      .map((msg) => ({
        id: msg.id,
        url: msg.attachment!.url!,
        type: msg.attachment!.type!,
        title: msg.attachment!.name,
      }));
  }, [activeMessages]);

  const docsList = React.useMemo(() => {
    return activeMessages
      .filter((msg) => msg.attachment && (msg.attachment.type === "document" || msg.attachment.type === "audio") && !msg.isDeleted)
      .map((msg) => {
        const ext = msg.attachment!.name.split(".").pop() || "pdf";
        let type = "pdf";
        if (ext === "xlsx" || ext === "xls" || ext === "csv") type = "spreadsheet";
        else if (ext === "zip" || ext === "rar" || ext === "gz") type = "zip";
        else if (msg.attachment!.type === "audio") type = "audio";

        return {
          id: msg.id,
          name: msg.attachment!.name,
          url: msg.attachment!.url!,
          type,
          size: msg.attachment!.size || "0 KB",
          date: msg.timestamp,
        };
      });
  }, [activeMessages]);

  const linksList = React.useMemo(() => {
    return activeMessages
      .filter((msg) => msg.content && /(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(msg.content) && !msg.isDeleted)
      .flatMap((msg, idx) => {
        const urls = msg.content.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi) || [];
        return urls.map((url, uidx) => {
          let domain = "Link";
          try {
            const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
            domain = parsed.hostname.replace("www.", "");
          } catch (e) {}

          return {
            id: `${msg.id}-${uidx}`,
            url: url.startsWith("http") ? url : `https://${url}`,
            domain,
            title: domain,
            description: url,
            thumbnail: "/assets/images/link-placeholder.png",
            date: msg.timestamp,
          };
        });
      });
  }, [activeMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/65 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-2xl h-[560px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
              Shared Assets
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-550 mt-1 leading-none">
              Shared with {roomName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 flex gap-6 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40">
          {(["media", "docs", "links"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold capitalize relative transition-colors ${
                activeTab === tab
                  ? "text-emerald-650 dark:text-[#19E68C]"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
              }`}
            >
              <span>
                {tab === "media" ? "Media" : tab === "docs" ? "Docs" : "Links"}
              </span>
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-[#19E68C] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content View Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/20 dark:bg-zinc-900/20">
          {activeTab === "media" && <MediaTab items={mediaList} />}
          {activeTab === "docs" && <DocsTab items={docsList} />}
          {activeTab === "links" && (
            <LinksTab items={linksList} copiedId={copiedId} onCopyLink={handleCopyLink} />
          )}
        </div>
      </div>
    </div>
  );
}
export default MediaModal;
