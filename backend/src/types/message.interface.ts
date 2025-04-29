import { Chat } from './chat.interface';
import { User } from './user.interface';

export interface Message {
  id: string;
  isPinned: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
  replyTo: Message | null;
  author: User;
  chat: Chat;
  replies: Message[];
  seenBy: User[];
}
