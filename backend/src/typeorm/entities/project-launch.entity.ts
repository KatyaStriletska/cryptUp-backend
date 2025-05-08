import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectLaunch } from '../../types/project-launch.interface';
import { Project } from '../../types/project.interface';
import { ProjectEntity } from './project.entity';
import { ProjectLaunchInvestmentEntity } from './project-launch-investment.entity';
import { ProjectLaunchInvestment } from '../../types/project-launch-investment.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { DaoEntity } from './dao.entity';
import { Dao } from '../../types/dao.interface';

@Entity('project_launch')
@Index(['name', 'author.id'], { unique: true })
export class ProjectLaunchEntity implements ProjectLaunch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', default: null })
  logo: string | null;

  @Column({ type: 'boolean', default: false })
  isFundraised: boolean;

  @Column({ type: 'int8' })
  fundraiseAmount: number;

  @Column({ type: 'int8', default: 0 })
  fundraiseProgress: number;

  @Column({ type: 'timestamptz' })
  fundraiseDeadline: Date;

  @Column({ type: 'text', array: true, default: [] })
  projectDocuments: string[];

  @Column({ type: 'jsonb', default: '[]' })
  team: any;

  @Column({ type: 'text' })
  businessModel: string;

  @Column({ type: 'text', default: '' })
  externalId: string;

  @Column({ type: 'text' })
  tokenomics: string;

  @Column({ type: 'jsonb', default: '{}' })
  roundDetails: any;

  @OneToOne(() => ProjectEntity)
  @JoinColumn({ name: 'projectId', referencedColumnName: 'id' })
  project: Project | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'text' })
  vaultTokenAccount: string;

  @Column({ type: 'text' })
  cryptoTrackerAccount: string;

  @ManyToOne(() => UserEntity, user => user.projectLaunches, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  author: User;

  @OneToMany(
    () => ProjectLaunchInvestmentEntity,
    projectLaunchInvestment => projectLaunchInvestment.projectLaunch,
  )
  projectLaunchInvestments?: ProjectLaunchInvestment[] | undefined;

  @Column({ type: 'text', default: null })
  businessAnalystReview: string | null;

  @ManyToOne(() => UserEntity, user => user.approvedProjectLaunches, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  approver: User;

  @OneToOne(() => DaoEntity, dao => dao.projectLaunch)
  dao: Dao;
}
