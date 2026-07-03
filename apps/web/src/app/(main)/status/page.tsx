"use client";

import React from "react";
import { StatusList } from "@/components/status/StatusList";
import { StatusDetailWindow } from "@/components/status/StatusDetailWindow";
import { StatusCreatorModal } from "@/components/status/StatusCreatorModal";
import { useStatus } from "@/hooks/use-status";

export default function StatusPage() {
  const {
    statuses,
    myStatus,
    activeUserId,
    activeUserStatus,
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
  } = useStatus();

  return (
    <>
      {/* Pane 2: List of Status updates */}
      <StatusList
        statuses={statuses}
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
        myStatus={myStatus}
        onCreateTextStatus={triggerCreateText}
        onCreateImageStatus={triggerCreateImage}
      />

      {/* Pane 3: Immersive viewer panel */}
      <StatusDetailWindow
        activeUserStatus={activeUserStatus}
        onClearSelection={() => setActiveUserId(null)}
        onNextUserStatus={handleNextUserStatus}
        onPrevUserStatus={handlePrevUserStatus}
        onMarkRead={handleMarkRead}
      />

      {/* Modal for creating a new status update */}
      <StatusCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onPublish={handlePublishStatus}
      />
    </>
  );
}
