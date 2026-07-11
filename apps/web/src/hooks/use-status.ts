import { useState, useMemo } from "react";
import { UserStatus } from "@/types/status";
import { useStatusStore } from "@/store/status-store";
import { useStatuses, usePublishStatus, useViewStory, useReactStory, useReplyToStory } from "@/hooks/api/use-status";
import { useAuthStore } from "@/store/auth-store";

const DEFAULT_MY_STATUS = (user: any): UserStatus => ({
  id: "me",
  userId: user?.id || "me",
  userName: user?.displayName || user?.username || "John Doe",
  userAvatar: user?.avatar || "",
  stories: [],
  lastUpdated: "Never",
  hasUnread: false,
});

export function useStatus() {
  const currentUser = useAuthStore((state) => state.user);
  
  // React Query queries and mutations
  const { data: statusesData } = useStatuses();
  const publishMutation = usePublishStatus();
  const viewStoryMutation = useViewStory();
  const reactStoryMutation = useReactStory();
  const replyToStoryMutation = useReplyToStory();

  const statuses = statusesData?.statuses || [];
  const myStatus = statusesData?.myStatus || DEFAULT_MY_STATUS(currentUser);

  // UI state from Zustand store
  const activeUserId = useStatusStore((state) => state.activeUserId);
  const setActiveUserId = useStatusStore((state) => state.setActiveUserId);

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [defaultCreatorType, setDefaultCreatorType] = useState<"text" | "image">("text");

  const activeUserStatus = useMemo(() => {
    if (activeUserId === "me" || activeUserId === currentUser?.id) return myStatus;
    return statuses.find((s) => s.userId === activeUserId) || null;
  }, [activeUserId, statuses, myStatus, currentUser]);

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
    // If the viewed status is "me", we don't mark viewed
    if (userId === "me" || userId === currentUser?.id) return;
    
    const status = statuses.find((s) => s.userId === userId);
    if (!status) return;

    status.stories.forEach((story) => {
      if (!story.viewed) {
        viewStoryMutation.mutate(story.id);
      }
    });
  };

  const handlePublishStatus = (
    newStoryData: {
      type: "text" | "image" | "video";
      content: string;
      backgroundColor?: string;
      fontFamily?: string;
      caption?: string;
    },
    file?: File
  ) => {
    publishMutation.mutate({
      storyData: {
        type: newStoryData.type,
        content: newStoryData.content,
        backgroundColor: newStoryData.backgroundColor,
        fontFamily: newStoryData.fontFamily,
        caption: newStoryData.caption,
      },
      file,
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
    reactStory: reactStoryMutation.mutate,
    replyToStory: replyToStoryMutation.mutate,
  };
}

export default useStatus;
