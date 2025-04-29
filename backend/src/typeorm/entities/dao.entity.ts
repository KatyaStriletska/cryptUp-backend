import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dao } from '../../types/dao.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { ProjectLaunchEntity } from './project-launch.entity';
import { ProjectLaunch } from '../../types/project-launch.interface';

@Entity('dao')
export class DaoEntity implements Dao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  multisigPda: string;

  @Column({ type: 'text' })
  vaultPda: string;

  @Column({ type: 'int8', default: 0 })
  threshold: number;

  @OneToOne(() => ProjectLaunchEntity, projectLaunch => projectLaunch.dao, { nullable: false })
  @JoinColumn({ name: 'projectLaunchId', referencedColumnName: 'id' })
  projectLaunch: ProjectLaunch;

  @ManyToMany(() => UserEntity, user => user.daos)
  @JoinTable({
    name: 'user_daos_dao',
    joinColumn: { name: 'daoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  removedAt: Date | null;
}
