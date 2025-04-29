import { ProposalStatusEnum } from '../types/enums/proposal-status.enum';
import { ProposalVote } from '../types/proposal-vote.interface';
import { CommandType } from '../utils/dao.utils';

export type ProposalVoteDto = Omit<ProposalVote, 'datetime' | 'member' | 'proposal' | 'proposalId'>;

export interface CreateProposalDto {
  type: CommandType;
  description: string;
  proposalLink?: string | null;
  milestone: { id: string };
  author: { id: string };
}

export interface UpdateProposalDto {
  status?: ProposalStatusEnum;
  proposalLink?: string | null;
  executedAt?: Date | null;
  updatedAt?: Date | null;
  votesToAdd?: ProposalVoteDto[];
}
