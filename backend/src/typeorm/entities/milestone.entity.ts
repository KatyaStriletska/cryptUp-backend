import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Milestone } from '../../types/milestone.interface';
import { ProjectEntity } from './project.entity';
import { Project } from '../../types/project.interface';
import { ProposalEntity } from './proposal.entity';
import { Proposal } from '../../types/proposal.interface';

@Entity('milestone')
export class MilestoneEntity implements Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 511 })
  mergedPullRequestUrl: string;

  @Column({ type: 'varchar', length: 511, default: null })
  transactionApprovalHash: string | null;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'boolean', default: false })
  isFinal: boolean;

  @Column({ type: 'boolean', default: false })
  isWithdrawn: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => ProjectEntity, project => project.milestones, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  project: Project;

  @OneToMany(() => ProposalEntity, proposal => proposal.milestone)
  proposals: Proposal[];
}
