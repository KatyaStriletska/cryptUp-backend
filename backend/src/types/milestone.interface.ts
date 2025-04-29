import { Project } from './project.interface';
import { Proposal } from './proposal.interface';

export interface Milestone {
  id: string;
  mergedPullRequestUrl: string;
  description: string;
  isFinal: boolean;
  isWithdrawn: boolean;
  transactionApprovalHash: string | null;
  createdAt: Date;
  project: Project;
  proposals: Proposal[];
}
