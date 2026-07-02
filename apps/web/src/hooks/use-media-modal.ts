import { useState, useEffect } from "react";

export function useMediaModal(isOpen: boolean, onClose: () => void) {
  const [activeTab, setActiveTab] = useState<"media" | "docs" | "links" | string>("media");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock scroll
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return {
    activeTab,
    setActiveTab,
    copiedId,
    handleCopyLink,
  };
}
export type UseMediaModalReturn = ReturnType<typeof useMediaModal>;
