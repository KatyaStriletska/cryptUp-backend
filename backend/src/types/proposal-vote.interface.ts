import { ProposalVoteEnum } from './enums/proposal-vote.enum';
import { Proposal } from './proposal.interface';
import { User } from './user.interface';

export interface ProposalVote {
  memberId: string;
  proposalId: string;
  member: User;
  proposal: Proposal;
  decision: ProposalVoteEnum;
  datetime: Date;
}
