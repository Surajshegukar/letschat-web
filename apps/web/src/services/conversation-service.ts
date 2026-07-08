import { api } from "@/lib/axios";

export const conversationService = {
  /**
   * Get paginated conversations list for the authenticated user.
   */
  async getConversations(page: number = 1, limit: number = 20) {
    const response = await api.get("/conversations", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Create a new conversation (direct or group).
   */
  async createConversation(data: {
    type: "direct" | "group";
    participantIds: string[];
    name?: string;
    description?: string;
  }) {
    const response = await api.post("/conversations", data);
    return response.data;
  },

  /**
   * Fetch details for a specific conversation by ID.
   */
  async getConversation(id: string) {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Fetch messages inside a conversation (cursor-based pagination).
   */
  async getMessages(conversationId: string, cursor?: string, limit: number = 50) {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { cursor, limit },
    });
    return response.data;
  },

  /**
   * Send a new message inside a conversation.
   */
  async sendMessage(
    conversationId: string,
    data: {
      content?: string;
      type?: "text" | "image" | "audio" | "video" | "document" | "system";
      replyTo?: string;
      attachments?: {
        url: string;
        filename: string;
        mimeType: string;
        size: number;
      }[];
    }
  ) {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      type: data.type || "text",
      content: data.content,
      replyTo: data.replyTo,
      attachments: data.attachments,
    });
    return response.data;
  },

  /**
   * Pin/Unpin a conversation.
   */
  async pinConversation(id: string) {
    const response = await api.patch(`/conversations/${id}/pin`);
    return response.data;
  },

  /**
   * Archive/Unarchive a conversation.
   */
  async archiveConversation(id: string) {
    const response = await api.patch(`/conversations/${id}/archive`);
    return response.data;
  },

  /**
   * Edit a message content.
   */
  async editMessage(conversationId: string, messageId: string, content: string) {
    const response = await api.patch(`/conversations/${conversationId}/messages/${messageId}`, { content });
    return response.data;
  },

  /**
   * Delete a message.
   */
  async deleteMessage(conversationId: string, messageId: string) {
    const response = await api.delete(`/conversations/${conversationId}/messages/${messageId}`);
    return response.data;
  },

  /**
   * React to a message with an emoji.
   */
  async reactToMessage(conversationId: string, messageId: string, emoji: string) {
    const response = await api.post(`/conversations/${conversationId}/messages/${messageId}/react`, { emoji });
    return response.data;
  },

  /**
   * Upload multiple attachment files.
   */
  async uploadAttachments(conversationId: string, formData: FormData) {
    const response = await api.post(`/conversations/${conversationId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete a conversation and all its messages.
   */
  async deleteConversation(id: string) {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Clear all messages in a conversation.
   */
  async clearConversation(id: string) {
    const response = await api.delete(`/conversations/${id}/clear`);
    return response.data;
  },

  /**
   * Toggle the starred state of a message.
   */
  async starMessage(conversationId: string, messageId: string) {
    const response = await api.patch(`/conversations/${conversationId}/messages/${messageId}/star`);
    return response.data;
  },
};
