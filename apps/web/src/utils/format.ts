/**
 * Format a Date object, string, or timestamp into 2-digit hour and minute format (e.g. "11:28 AM")
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Format a byte size to a human-readable string (e.g. 1024 -> "1.0 KB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
