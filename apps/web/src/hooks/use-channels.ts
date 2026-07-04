import { useMemo } from "react";
import { useChannelsStore } from "@/store/channels-store";

export function useChannels() {
  const channels = useChannelsStore((state) => state.channels);
  const activeChannelId = useChannelsStore((state) => state.activeChannelId);
  const setActiveChannelId = useChannelsStore((state) => state.setActiveChannelId);
  const handleFollowToggle = useChannelsStore((state) => state.toggleFollow);
  const handleReactToStory = useChannelsStore((state) => state.reactToStory);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || null;
  }, [activeChannelId, channels]);

  return {
    channels,
    activeChannelId,
    activeChannel,
    setActiveChannelId,
    handleFollowToggle,
    handleReactToStory,
  };
}

export default useChannels;
