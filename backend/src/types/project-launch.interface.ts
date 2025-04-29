import { Dao } from './dao.interface';
import { ProjectLaunchInvestment } from './project-launch-investment.interface';
import { Project } from './project.interface';
import { User } from './user.interface';

export interface ProjectLaunch {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  isFundraised: boolean;
  fundraiseAmount: number;
  fundraiseProgress: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: any;
  businessModel: string;
  tokenomics: string;
  roundDetails: any;
  project: Project | null;
  author: User;
  approver: User;
  projectLaunchInvestments?: ProjectLaunchInvestment[];
  createdAt: Date;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
  businessAnalystReview: string | null;
  dao: Dao;
}
