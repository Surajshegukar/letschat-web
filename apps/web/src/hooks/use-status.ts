import { useState, useEffect, useMemo } from "react";
import { UserStatus, StatusStory } from "@/types/status";
import { statusService } from "@/services/status-service";

export function useStatus() {
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [myStatus, setMyStatus] = useState<UserStatus | null>({
    id: "me",
    userId: "me",
    userName: "My Status",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    stories: [],
    lastUpdated: "Never",
    hasUnread: false,
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [defaultCreatorType, setDefaultCreatorType] = useState<"text" | "image">("text");

  // Load initial statuses from statusService
  useEffect(() => {
    statusService.getStatuses().then(setStatuses);
  }, []);

  const activeUserStatus = useMemo(() => {
    if (activeUserId === "me") return myStatus;
    return statuses.find((s) => s.userId === activeUserId) || null;
  }, [activeUserId, statuses, myStatus]);

  const viewableStatuses = useMemo(() => {
    const list: UserStatus[] = [];
    if (myStatus && myStatus.stories.length > 0) {
      list.push(myStatus);
    }
    statuses.forEach((s) => {
      if (s.stories.length > 0) {
        list.push(s);
      }
    });
    return list;
  }, [statuses, myStatus]);

  const handleNextUserStatus = () => {
    if (!activeUserId) return;
    const currentIndex = viewableStatuses.findIndex((v) => v.userId === activeUserId);
    if (currentIndex !== -1 && currentIndex < viewableStatuses.length - 1) {
      const nextStatus = viewableStatuses[currentIndex + 1];
      if (nextStatus) {
        setActiveUserId(nextStatus.userId);
      }
    } else {
      setActiveUserId(null);
    }
  };

  const handlePrevUserStatus = () => {
    if (!activeUserId) return;
    const currentIndex = viewableStatuses.findIndex((v) => v.userId === activeUserId);
    if (currentIndex > 0) {
      const prevStatus = viewableStatuses[currentIndex - 1];
      if (prevStatus) {
        setActiveUserId(prevStatus.userId);
      }
    } else {
      setActiveUserId(null);
    }
  };

  const handleMarkRead = (userId: string) => {
    if (userId === "me") return;
    setStatuses((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, hasUnread: false } : s))
    );
  };

  const handlePublishStatus = (newStoryData: {
    type: "text" | "image";
    content: string;
    backgroundColor?: string;
    fontFamily?: string;
    caption?: string;
  }) => {
    statusService.publishStatus(newStoryData).then((newStory) => {
      setMyStatus((prev) => {
        const updatedStories = prev ? [...prev.stories, newStory] : [newStory];
        return {
          id: "me",
          userId: "me",
          userName: "John Doe",
          userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          stories: updatedStories,
          lastUpdated: "Just now",
          hasUnread: false,
        };
      });
    });
  };

  const triggerCreateText = () => {
    setDefaultCreatorType("text");
    setIsCreatorOpen(true);
  };

  const triggerCreateImage = () => {
    setDefaultCreatorType("image");
    setIsCreatorOpen(true);
  };

  return {
    statuses,
    myStatus,
    activeUserId,
    activeUserStatus,
    viewableStatuses,
    isCreatorOpen,
    defaultCreatorType,
    setActiveUserId,
    setIsCreatorOpen,
    handleNextUserStatus,
    handlePrevUserStatus,
    handleMarkRead,
    handlePublishStatus,
    triggerCreateText,
    triggerCreateImage,
  };
}
export default useStatus;
