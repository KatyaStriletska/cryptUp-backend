import { Project } from './project.interface';
import { User } from './user.interface';

export interface UserToProject {
  id: number;
  projectId: string;
  userId: string;
  project: Project;
  user: User;
}
