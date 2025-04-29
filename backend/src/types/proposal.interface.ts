import { CommandType } from '../utils/dao.utils';
import { ProposalStatusEnum } from './enums/proposal-status.enum';
import { Milestone } from './milestone.interface';
import { ProposalVote } from './proposal-vote.interface';
import { User } from './user.interface';

export interface Proposal {
  id: string;
  type: CommandType;
  description: string;
  proposalLink: string | null;
  status: ProposalStatusEnum;
  createdAt: Date;
  executedAt: Date | null;
  updatedAt: Date | null;
  milestone: Milestone;
  author: User;
  votes: ProposalVote[];
}
