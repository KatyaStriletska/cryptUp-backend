import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../../types/message.interface';
import { Chat } from '../../types/chat.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';

@Entity('message')
export class MessageEntity implements Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  removedAt: Date | null;

  @ManyToOne(() => MessageEntity, message => message.replies, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  replyTo: Message | null;

  @ManyToOne(() => UserEntity, user => user.messages, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  author: User;

  @ManyToOne(() => ChatEntity, chat => chat.messages, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  chat: Chat;

  @OneToMany(() => MessageEntity, message => message.replyTo)
  replies: Message[];

  @ManyToMany(() => UserEntity, user => user.seenMessages, { cascade: true })
  @JoinTable()
  seenBy: User[];
}
