"use client";

import React from "react";
import { CommunitiesList } from "@/components/communities/CommunitiesList";
import { CommunityDetailWindow } from "@/components/communities/CommunityDetailWindow";
import { useCommunities } from "@/hooks/use-communities";

export default function CommunitiesPage() {
  const {
    communities,
    groupMessages,
    activeCommunityId,
    activeGroupId,
    activeCommunity,
    activeGroup,
    handleSelectGroup,
    handleSendMessageToGroup,
  } = useCommunities();

  return (
    <>
      <div className={`${activeCommunityId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <CommunitiesList
          communities={communities}
          activeCommunityId={activeCommunityId}
          activeGroupId={activeGroupId}
          onSelectGroup={handleSelectGroup}
        />
      </div>

      <div className={`${activeCommunityId ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        <CommunityDetailWindow
          activeCommunity={activeCommunity}
          activeGroup={activeGroup}
          onClearSelection={() => handleSelectGroup("", null)}
          onSendMessageToGroup={handleSendMessageToGroup}
          groupMessages={groupMessages}
          onSelectGroup={handleSelectGroup}
          showBack={!!activeCommunityId}
        />
      </div>
    </>
  );
}
