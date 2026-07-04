import { useMemo } from "react";
import { useCommunitiesStore } from "@/store/communities-store";

export function useCommunities() {
  const communities = useCommunitiesStore((state) => state.communities);
  const groupMessages = useCommunitiesStore((state) => state.groupMessages);
  const activeCommunityId = useCommunitiesStore((state) => state.activeCommunityId);
  const activeGroupId = useCommunitiesStore((state) => state.activeGroupId);
  const selectGroup = useCommunitiesStore((state) => state.selectGroup);
  const sendMessageToGroup = useCommunitiesStore((state) => state.sendMessageToGroup);

  const activeCommunity = useMemo(() => {
    return communities.find((c) => c.id === activeCommunityId) || null;
  }, [activeCommunityId, communities]);

  const activeGroup = useMemo(() => {
    if (!activeCommunity || !activeGroupId) return null;
    return activeCommunity.groups.find((g) => g.id === activeGroupId) || null;
  }, [activeGroupId, activeCommunity]);

  const handleSelectGroup = (communityId: string, groupId: string | null) => {
    selectGroup(communityId, groupId);
  };

  const handleSendMessageToGroup = (communityId: string, groupId: string, text: string) => {
    sendMessageToGroup(communityId, groupId, text);
  };

  return {
    communities,
    groupMessages,
    activeCommunityId,
    activeGroupId,
    activeCommunity,
    activeGroup,
    handleSelectGroup,
    handleSendMessageToGroup,
  };
}

export default useCommunities;
