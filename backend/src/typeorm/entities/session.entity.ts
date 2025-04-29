import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Session } from '../../types/session.interface';
import { UserEntity } from './user.entity';
import { User } from '../../types/user.interface';

@Entity('session')
export class SessionEntity implements Session {
  @PrimaryColumn({ type: 'varchar' })
  sessionId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
