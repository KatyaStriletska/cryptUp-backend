import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../types/project.interface';
import { MilestoneEntity } from './milestone.entity';
import { DataAccountEntity } from './data-account.entity';
import { UserToProjectEntity } from './user-to-project.entity';
import { ProjectLaunch } from '../../types/project-launch.interface';
import { ProjectLaunchEntity } from './project-launch.entity';
import { DataAccount } from '../../types/data-account.interface';
import { UserToProject } from '../../types/user-to-project.interface';
import { Milestone } from '../../types/milestone.interface';

@Entity('project')
@Index(['projectLaunchName', 'projectLaunch.id'], { unique: true })
export class ProjectEntity implements Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  projectLaunchName: string;

  @Column({ type: 'boolean', default: false })
  isFinal: boolean;

  @Column({ type: 'text' })
  projectLaunchDescription: string;

  @Column({ type: 'int8' })
  projectLaunchRaisedFunds: number;

  @Column({ type: 'int' })
  milestoneNumber: number;

  @Column({ type: 'text', nullable: true, default: null})
  tokenMintAddress: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => MilestoneEntity, milestone => milestone.project)
  milestones: Milestone[];

  @OneToOne(() => DataAccountEntity, dataAccount => dataAccount.project)
  dataAccount: DataAccount;

  @OneToMany(() => UserToProjectEntity, userToProject => userToProject.project, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userToProjects: UserToProject[];

  @OneToOne(() => ProjectLaunchEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'projectLaunchId', referencedColumnName: 'id' })
  projectLaunch: ProjectLaunch;
}
