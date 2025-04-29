import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from '../../types/chat.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { UserToChatEntity } from './user-to-chat.entity';
import { UserToChat } from '../../types/user-to-chat.interface';
import { MessageEntity } from './message.entity';
import { Message } from '../../types/message.interface';

@Entity('chat')
export class ChatEntity implements Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  image: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  removedAt: Date | null;

  @OneToMany(() => UserToChatEntity, userToChat => userToChat.chat)
  usersToChat: UserToChat[];

  @ManyToMany(() => UserEntity, user => user.archivedChats)
  archivedBy: User[];

  @ManyToMany(() => UserEntity, user => user.favouriteChats)
  favouriteFor: User[];

  @OneToMany(() => MessageEntity, message => message.chat)
  messages: Message[];
}
