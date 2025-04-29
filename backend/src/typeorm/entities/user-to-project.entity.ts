import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserToProject } from '../../types/user-to-project.interface';
import { ProjectEntity } from './project.entity';
import { UserEntity } from './user.entity';
import { Project } from '../../types/project.interface';
import { User } from '../../types/user.interface';

@Entity('user_to_project')
export class UserToProjectEntity implements UserToProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: string;

  @Column()
  userId: string;

  @ManyToOne(() => ProjectEntity, project => project.userToProjects, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => UserEntity, user => user.userToProjects, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
