import { useState, useMemo } from "react";
import { UserStatus } from "@/types/status";
import { useStatusStore } from "@/store/status-store";

export function useStatus() {
  const statuses = useStatusStore((state) => state.statuses);
  const myStatus = useStatusStore((state) => state.myStatus);
  const activeUserId = useStatusStore((state) => state.activeUserId);
  const setActiveUserId = useStatusStore((state) => state.setActiveUserId);
  const markRead = useStatusStore((state) => state.markRead);
  const publishStatus = useStatusStore((state) => state.publishStatus);

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [defaultCreatorType, setDefaultCreatorType] = useState<"text" | "image">("text");

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
    markRead(userId);
  };

  const handlePublishStatus = (newStoryData: {
    type: "text" | "image";
    content: string;
    backgroundColor?: string;
    fontFamily?: string;
    caption?: string;
  }) => {
    publishStatus(newStoryData);
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
