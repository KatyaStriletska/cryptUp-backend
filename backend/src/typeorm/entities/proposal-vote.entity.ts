import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProposalVote } from '../../types/proposal-vote.interface';
import { ProposalVoteEnum } from '../../types/enums/proposal-vote.enum';
import { Proposal } from '../../types/proposal.interface';
import { User } from '../../types/user.interface';
import { ProposalEntity } from './proposal.entity';
import { UserEntity } from './user.entity';

@Entity('proposal_vote')
export class ProposalVoteEntity implements ProposalVote {
  @PrimaryColumn({ type: 'uuid' })
  memberId: string;

  @PrimaryColumn({ type: 'uuid' })
  proposalId: string;

  @ManyToOne(() => UserEntity, user => user.proposalVotes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  member: User;

  @ManyToOne(() => ProposalEntity, proposal => proposal.votes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  proposal: Proposal;

  @Column({ type: 'enum', enum: ProposalVoteEnum })
  decision: ProposalVoteEnum;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  datetime: Date;
}
