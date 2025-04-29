import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import {
  CreateDaoDto,
  UpdateDaoDto,
  DaoMemberDto,
  BlockchainAddMemberDto,
  BlockchainWithdrawDto,
  BlockchainExecuteProposalDto,
  BlockchainVoteDto,
  BlockchainChangeThresholdDto,
} from '../../DTO/dao.dto';
import { CommandType } from '../../utils/dao.utils';
import { rabbitMQ } from '../../utils/rabbitmq.utils';
import { DaoEntity } from '../../typeorm/entities/dao.entity';
import AppDataSource from '../../typeorm/index.typeorm';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';
import { UserEntity } from '../../typeorm/entities/user.entity';

export class DAOService {
  async findMany(options?: FindManyOptions<DaoEntity>): Promise<DaoEntity[]> {
    try {
      return await AppDataSource.getRepository(DaoEntity).find(
        _.merge(options, {
          relations: { projectLaunch: true, members: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<DaoEntity>): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail(
        _.merge(options, {
          relations: { projectLaunch: true, members: true },
        }),
      );

      return dao;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The dao with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateDaoDto): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).save(data);

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        where: { id: dao.id },
        relations: { projectLaunch: true, members: true },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateDaoDto): Promise<DaoEntity> {
    try {
      const { membersToAdd, membersToRemove, ...rest } = data;

      await AppDataSource.getRepository(DaoEntity).update(
        { id },
        { updatedAt: new Date(), ...rest },
      );

      if (membersToAdd) {
        await this.addMembersToDao(id, membersToAdd);
      }

      if (membersToRemove) {
        await this.removeMembersFromDao(id, membersToRemove);
      }

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the dao. The dao with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });

      await AppDataSource.getRepository(DaoEntity).remove(structuredClone(dao));

      return dao;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the dao. The dao with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async addMembersToDao(id: string, members: DaoMemberDto[]): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        where: { id },
        relations: { members: true, projectLaunch: { approver: true } },
      });

      const existingUsers = (
        (
          await Promise.allSettled(
            members.map(member =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: member.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => result.value);

      dao.members = existingUsers;

      await AppDataSource.getRepository(DaoEntity).save(dao);

      existingUsers.forEach(member => {
        rabbitMQ.publish(
          'broker.request',
          {
            multisig_pda: dao.multisigPda,
            pubkey: member.walletId,
            permissions: [],
          } as BlockchainAddMemberDto,
          CommandType.AddMember,
        );
      });

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot add members to the dao. The dao or some of the members with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async removeMembersFromDao(id: string, members: DaoMemberDto[]): Promise<DaoEntity> {
    try {
      const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        where: { id },
        relations: { members: true, projectLaunch: { approver: true } },
      });

      const existingUsers = (
        (
          await Promise.allSettled(
            members.map(member =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: member.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => result.value);

      dao.members = dao.members.filter(
        member => !existingUsers.find(user => user.id === member.id),
      );

      await AppDataSource.getRepository(DaoEntity).save(dao);

      existingUsers.forEach(member => {
        rabbitMQ.publish(
          'broker.request',
          {
            multisig_pda: dao.multisigPda,
            pubkey: member.walletId,
            permissions: [],
          } as BlockchainAddMemberDto,
          CommandType.RemoveMember,
        );
      });

      rabbitMQ.receive('response_queue', 'broker.response', (message, error) => {
        if (message) console.log(message);
        if (error) console.log(error);
      });

      return await AppDataSource.getRepository(DaoEntity).findOneOrFail({
        relations: { projectLaunch: true, members: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove members from the dao. The dao with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async withdraw(withdrawDto: BlockchainWithdrawDto) {
    console.log(withdrawDto);
    rabbitMQ.publish('broker.request', withdrawDto, CommandType.Withdraw);
  }

  async executeProposal(proposal: BlockchainExecuteProposalDto) {
    console.log('project ', proposal.multisig_pda);
    rabbitMQ.publish('broker.request', proposal, CommandType.ProposalExecute);
  }

  async vote(vote: BlockchainVoteDto) {
    console.log('project ', vote.multisig_pda);
    console.log('voting ', vote.vote);
    rabbitMQ.publish('broker.request', vote, CommandType.Vote);
  }

  async changeThreshold(threshold: BlockchainChangeThresholdDto) {
    console.log('project ', threshold.multisig_pda);
    rabbitMQ.publish('broker.request', threshold, CommandType.ChangeThreshold);
  }
}

export default new DAOService();
