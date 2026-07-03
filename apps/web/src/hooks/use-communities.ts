import { useState, useEffect, useMemo } from "react";
import { Community, CommunityGroup, GroupMessage } from "@/types/communities";
import { communitiesService } from "@/services/communities-service";

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [groupMessages, setGroupMessages] = useState<Record<string, GroupMessage[]>>({});
  
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Load initial communities and messages from services
  useEffect(() => {
    communitiesService.getCommunities().then(setCommunities);
    communitiesService.getMessages().then(setGroupMessages);
  }, []);

  const activeCommunity = useMemo(() => {
    return communities.find((c) => c.id === activeCommunityId) || null;
  }, [activeCommunityId, communities]);

  const activeGroup = useMemo(() => {
    if (!activeCommunity || !activeGroupId) return null;
    return activeCommunity.groups.find((g) => g.id === activeGroupId) || null;
  }, [activeGroupId, activeCommunity]);

  const handleSelectGroup = (communityId: string, groupId: string | null) => {
    setActiveCommunityId(communityId);
    setActiveGroupId(groupId);

    if (groupId) {
      setCommunities((prev) =>
        prev.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              groups: c.groups.map((g) => (g.id === groupId ? { ...g, unreadCount: 0 } : g)),
            };
          }
          return c;
        })
      );
    }
  };

  const handleSendMessageToGroup = (communityId: string, groupId: string, text: string) => {
    communitiesService.sendMessage(text).then((newMessage) => {
      // Append message to logs
      setGroupMessages((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newMessage],
      }));

      // Update communities sidebar listings info
      setCommunities((prev) =>
        prev.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              groups: c.groups.map((g) => {
                if (g.id === groupId) {
                  return {
                    ...g,
                    lastMessage: `You: ${text}`,
                    timestamp: "Just now",
                  };
                }
                return g;
              }),
            };
          }
          return c;
        })
      );
    });
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
