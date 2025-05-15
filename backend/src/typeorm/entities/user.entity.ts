import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../types/user.interface';
import { SessionEntity } from './session.entity';
import { Session } from '../../types/session.interface';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import { UserToProjectEntity } from './user-to-project.entity';
import { UserToProject } from '../../types/user-to-project.interface';
import { ProjectLaunchInvestmentEntity } from './project-launch-investment.entity';
import { ProjectLaunchInvestment } from '../../types/project-launch-investment.interface';
import { ProjectLaunchEntity } from './project-launch.entity';
import { ProjectLaunch } from '../../types/project-launch.interface';
import { Chat } from '../../types/chat.interface';
import { ChatEntity } from './chat.entity';
import { UserToChatEntity } from './user-to-chat.entity';
import { UserToChat } from '../../types/user-to-chat.interface';
import { MessageEntity } from './message.entity';
import { Message } from '../../types/message.interface';
import { Dao } from '../../types/dao.interface';
import { DaoEntity } from './dao.entity';
import { ProposalEntity } from './proposal.entity';
import { Proposal } from '../../types/proposal.interface';
import { ProposalVoteEntity } from './proposal-vote.entity';
import { ProposalVote } from '../../types/proposal-vote.interface';

@Entity('user')
export class UserEntity implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: false })
  walletId: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRoleEnum, array: true, default: [UserRoleEnum.Startup] })
  role: UserRoleEnum[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', default: null })
  password: string | null;

  @Column({ type: 'text', default: null })
  avatar: string | null;

  @Column({ type: 'text', default: null })
  bio: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  street?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @OneToOne(() => SessionEntity, session => session.user, { nullable: true })
  session: Session;

  @OneToMany(() => ProjectLaunchEntity, projectLaunch => projectLaunch.author)
  projectLaunches: ProjectLaunch[];

  @OneToMany(() => ProjectLaunchEntity, projectLaunch => projectLaunch.approver)
  approvedProjectLaunches: ProjectLaunch[];

  @OneToMany(() => UserToProjectEntity, userToProject => userToProject.user)
  userToProjects: UserToProject[];

  @OneToMany(
    () => ProjectLaunchInvestmentEntity,
    projectLaunchInvestment => projectLaunchInvestment.investor,
  )
  projectLaunchInvestments?: ProjectLaunchInvestment[];

  @OneToMany(() => UserToChatEntity, userToChat => userToChat.user)
  userToChats: UserToChat[];

  @ManyToMany(() => ChatEntity, chat => chat.archivedBy, { cascade: true })
  @JoinTable()
  archivedChats: Chat[];

  @ManyToMany(() => ChatEntity, chat => chat.favouriteFor, { cascade: true })
  @JoinTable()
  favouriteChats: Chat[];

  @OneToMany(() => MessageEntity, message => message.author)
  messages: Message[];

  @ManyToMany(() => MessageEntity, message => message.seenBy)
  seenMessages: Message[];

  @ManyToMany(() => DaoEntity, dao => dao.members, { cascade: true })
  daos: Dao[];

  @OneToMany(() => ProposalEntity, proposal => proposal.author)
  proposals: Proposal[];

  @OneToMany(() => ProposalVoteEntity, proposalVote => proposalVote.member)
  proposalVotes: ProposalVote[];
}
