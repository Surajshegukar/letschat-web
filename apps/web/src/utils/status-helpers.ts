export interface StatusRingConfig {
  radius: number;
  strokeDasharray: string;
  cx: number;
  cy: number;
  strokeWidth: number;
  isUnread: boolean;
}

/**
 * Calculates SVG properties (radius, center coordinates, and stroke dash arrays)
 * for a segmented status indicator ring around an avatar image.
 */
export function calculateStatusRing(
  size: number,
  storiesCount: number,
  unreadCount: number,
  strokeWidth = 2.5
): StatusRingConfig {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const gapSize = storiesCount > 1 ? 3.5 : 0;
  const totalGapLength = storiesCount * gapSize;
  // Fallback check to avoid negative math values
  const segmentLength = Math.max(0, (circumference - totalGapLength) / Math.max(1, storiesCount));
  const strokeDasharray = `${segmentLength} ${gapSize}`;

  const isUnread = unreadCount > 0;

  return {
    radius,
    strokeDasharray,
    cx,
    cy,
    strokeWidth,
    isUnread,
  };
}
