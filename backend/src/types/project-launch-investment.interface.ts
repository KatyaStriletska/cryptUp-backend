import { ProjectLaunch } from './project-launch.interface';
import { User } from './user.interface';

export interface ProjectLaunchInvestment {
  id: string;
  investor: User;
  projectLaunch: ProjectLaunch;
  amount: number;
  createdAt: Date;
}
