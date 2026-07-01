export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  roomId: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  isGroup: boolean;
  participants: string[];
}
