import { Milestone } from './milestone.interface';
import { ProjectLaunch } from './project-launch.interface';
import { Proposal } from './proposal.interface';

export interface Project {
  id: string;
  projectLaunchName: string;
  projectLaunchDescription: string;
  projectLaunchRaisedFunds: number;
  milestoneNumber: number;
  isFinal: boolean;
  createdAt: Date;
  projectLaunch: ProjectLaunch;
  milestones: Milestone[];
  tokenMintAddress: string | null;
}
