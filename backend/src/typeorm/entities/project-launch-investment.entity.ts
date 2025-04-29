import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectLaunchInvestment } from '../../types/project-launch-investment.interface';
import { ProjectLaunch } from '../../types/project-launch.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { ProjectLaunchEntity } from './project-launch.entity';

@Entity('project_launch_investment')
export class ProjectLaunchInvestmentEntity implements ProjectLaunchInvestment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.projectLaunchInvestments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  investor: User;

  @ManyToOne(() => ProjectLaunchEntity, projectLaunch => projectLaunch.projectLaunchInvestments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  projectLaunch: ProjectLaunch;

  @Column({ type: 'int8', default: 0 })
  amount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
