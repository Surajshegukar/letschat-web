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
      {/* Pane 2: Communities Organization Directories */}
      <CommunitiesList
        communities={communities}
        activeCommunityId={activeCommunityId}
        activeGroupId={activeGroupId}
        onSelectGroup={handleSelectGroup}
      />

      {/* Pane 3: Community Homepage or Subgroup Chat dialogue */}
      <CommunityDetailWindow
        activeCommunity={activeCommunity}
        activeGroup={activeGroup}
        onClearSelection={() => {
          handleSelectGroup("", null);
        }}
        onSendMessageToGroup={handleSendMessageToGroup}
        groupMessages={groupMessages}
        onSelectGroup={handleSelectGroup}
      />
    </>
  );
}
