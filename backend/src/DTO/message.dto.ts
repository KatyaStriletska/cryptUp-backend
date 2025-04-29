export interface CreateMessageDto {
  author: { id: string };
  chat: { id: string };
  replyTo?: { id: string } | null;
  content: string;
}

export interface UpdateMessageDto {
  content?: string;
  isPinned?: boolean;
  updatedAt?: Date | null;
  removedAt?: Date | null;
  seenBy?: string;
}
