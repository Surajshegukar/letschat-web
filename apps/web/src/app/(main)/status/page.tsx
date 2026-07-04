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
      <div className={`${activeUserId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <StatusList
          statuses={statuses}
          activeUserId={activeUserId}
          onSelectUser={setActiveUserId}
          myStatus={myStatus}
          onCreateTextStatus={triggerCreateText}
          onCreateImageStatus={triggerCreateImage}
        />
      </div>

      <div className={`${activeUserId ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        <StatusDetailWindow
          activeUserStatus={activeUserStatus}
          onClearSelection={() => setActiveUserId(null)}
          onNextUserStatus={handleNextUserStatus}
          onPrevUserStatus={handlePrevUserStatus}
          onMarkRead={handleMarkRead}
        />
      </div>

      <StatusCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onPublish={handlePublishStatus}
      />
    </>
  );
}
