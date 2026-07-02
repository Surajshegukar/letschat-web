import { useState } from "react";

export function useSidebar(initialCollapsed = true) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const expandSidebar = () => setIsCollapsed(false);
  const collapseSidebar = () => setIsCollapsed(true);

  return {
    isCollapsed,
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
  };
}
export type UseSidebarReturn = ReturnType<typeof useSidebar>;
