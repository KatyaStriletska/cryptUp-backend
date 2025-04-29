import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserToChat } from '../../types/user-to-chat.interface';
import { Chat } from '../../types/chat.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';

@Entity('user_to_chat')
export class UserToChatEntity implements UserToChat {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'uuid' })
  chatId: string;

  @ManyToOne(() => UserEntity, user => user.userToChats, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => ChatEntity, chat => chat.usersToChat, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  chat: Chat;
}
