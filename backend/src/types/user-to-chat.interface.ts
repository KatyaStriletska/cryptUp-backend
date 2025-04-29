import { Chat } from './chat.interface';
import { User } from './user.interface';

export interface UserToChat {
  userId: string;
  chatId: string;
  user: User;
  chat: Chat;
}
