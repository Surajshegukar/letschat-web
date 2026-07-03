import React from "react";
import { Users } from "lucide-react";
import { Community, CommunityGroup, GroupMessage } from "@/types/communities";
import { CommunityHomepage } from "./CommunityHomepage";
import { CommunityChatWindow } from "./CommunityChatWindow";

interface CommunityDetailWindowProps {
  activeCommunity: Community | null;
  activeGroup: CommunityGroup | null;
  onClearSelection: () => void;
  onSendMessageToGroup: (communityId: string, groupId: string, text: string) => void;
  groupMessages: Record<string, GroupMessage[]>;
  onSelectGroup: (communityId: string, groupId: string | null) => void;
}

export function CommunityDetailWindow({
  activeCommunity,
  activeGroup,
  onClearSelection,
  onSendMessageToGroup,
  groupMessages,
  onSelectGroup,
}: CommunityDetailWindowProps) {
  if (!activeCommunity) {
    /* 1. EMPTY STATE */
    return (
      <div className="flex-1 h-full bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative flex items-center justify-center h-24 w-24">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#19E68C] animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#00C9FF]/10 to-[#19E68C]/10 filter blur-sm animate-pulse" />
          <Users className="h-9 w-9 text-emerald-500/80 dark:text-[#19E68C]/80" />
        </div>
        <h3 className="mt-8 text-xl font-bold text-slate-800 dark:text-zinc-200">
          Communities Hub
        </h3>
        <p className="mt-2 text-sm text-zinc-450 max-w-sm">
          Select a community workspace to view its directory or chat in nested channels.
        </p>
      </div>
    );
  }

  const currentMessages = activeGroup ? groupMessages[activeGroup.id] || [] : [];

  return (
    <div className="flex-1 h-full bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col justify-between relative overflow-hidden select-none">
      {activeGroup === null ? (
        <CommunityHomepage
          activeCommunity={activeCommunity}
          onClearSelection={onClearSelection}
          onSelectGroup={onSelectGroup}
        />
      ) : (
        <CommunityChatWindow
          activeCommunity={activeCommunity}
          activeGroup={activeGroup}
          onSelectGroup={onSelectGroup}
          onSendMessageToGroup={onSendMessageToGroup}
          currentMessages={currentMessages}
        />
      )}
    </div>
  );
}

export default CommunityDetailWindow;
