import { Message } from './message.interface';
import { UserToChat } from './user-to-chat.interface';
import { User } from './user.interface';

export interface Chat {
  id: string;
  name: string | null;
  image: string | null;
  description: string | null;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
  usersToChat: UserToChat[];
  archivedBy: User[];
  favouriteFor: User[];
  messages: Message[];
}
