export interface CallHistoryItem {
  id: string;
  timestamp: string;
  type: "incoming" | "outgoing" | "missed";
  duration?: string;
}

export interface CallRecord {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  type: "audio" | "video";
  status: "incoming" | "outgoing" | "missed";
  timestamp: string; // Latest call date/time
  history: CallHistoryItem[];
}
