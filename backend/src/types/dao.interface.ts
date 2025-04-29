import { ProjectLaunch } from './project-launch.interface';
import { User } from './user.interface';

export interface Dao {
  id: string;
  multisigPda: string;
  vaultPda: string;
  members: User[];
  projectLaunch: ProjectLaunch;
  threshold: number;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
}
