import AppDataSource from '../../typeorm/index.typeorm';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { ProjectLaunchEntity } from '../../typeorm/entities/project-launch.entity';
import { CreateProjectLaunchDto, UpdateProjectLaunchDto } from '../../DTO/project-launch.dto';
import {
  CreateProjectLaunchInvestmentDto,
  UpdateProjectLaunchInvestmentDto,
} from '../../DTO/project-launch-investment.dto';
import { ProjectLaunchInvestmentEntity } from '../../typeorm/entities/project-launch-investment.entity';
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
} from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';
import { rabbitMQ } from '../../utils/rabbitmq.utils';
import { CommandType } from '../../utils/dao.utils';
import userService from '../user/user.service';
import { DaoEntity } from '../../typeorm/entities/dao.entity';

export class ProjectLaunchService {
  async findMany(options?: FindManyOptions<ProjectLaunchEntity>): Promise<ProjectLaunchEntity[]> {
    try {
      return await AppDataSource.getRepository(ProjectLaunchEntity).find(
        _.merge(options, {
          relations: {
            author: true,
            project: true,
            approver: true,
            dao: { members: true },
          },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<ProjectLaunchEntity>): Promise<ProjectLaunchEntity> {
    try {
      return await AppDataSource.getRepository(ProjectLaunchEntity).findOneOrFail(
        _.merge(options, {
          relations: {
            author: true,
            project: true,
            approver: true,
            dao: { members: true },
          },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The project launch with provided data does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateProjectLaunchDto): Promise<ProjectLaunchEntity> {
    console.log("CREATE Project launch", data);
    
    try {
      const exists = await AppDataSource.getRepository(ProjectLaunchEntity).exists({
        where: {
          name: data.name,
          author: { id: data.authorId },
          dao: { members: true },
        },
      });

      if (exists) {
        throw new ConflictException('The record with such name already exists.');
      }

      const projectLaunch = await AppDataSource.getRepository(ProjectLaunchEntity).save({
        ...data,
        author: { id: data.authorId },
      });

      return await AppDataSource.getRepository(ProjectLaunchEntity).findOneOrFail({
        where: { id: projectLaunch.id },
        relations: { author: true, project: true },
      });
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateProjectLaunchDto): Promise<ProjectLaunchEntity> {
    try {
      const { approverId } = data;
      delete data.approverId;
      console.log("UPDATE project launch", data)
      if (approverId) {
        const dao = await AppDataSource.getRepository(DaoEntity).findOne({
          where: { projectLaunch: { id } },
        });
        console.log(dao)

        if (!dao) {
          console.log("NOW WILL CREATE DAO", id, "  ", CommandType.CreateDao);
          rabbitMQ.publish('broker.request', { project_id: id }, CommandType.CreateDao);
          await new Promise(resolve => setTimeout(resolve, 2000));

        }
        const dao1 = await AppDataSource.getRepository(DaoEntity).findOne({
          where: { projectLaunch: { id } },
        });
        console.log("DAO AFTER ", dao1)
        
      }

      await AppDataSource.getRepository(ProjectLaunchEntity).update(
        { id },
        {
          ...data,
          ...(approverId ? { approver: { id: approverId } } : {}),
        },
      );

      return await AppDataSource.getRepository(ProjectLaunchEntity).findOneOrFail({
        relations: {
          author: true,
          project: true,
          approver: true,
          dao: { members: true },
        },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the project launch. The project launch with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<ProjectLaunchEntity> {
    try {
      const projectLaunch = await AppDataSource.getRepository(ProjectLaunchEntity).findOneOrFail({
        relations: {
          author: true,
          project: true,
          approver: true,
          dao: { members: true },
        },
        where: { id },
      });

      await AppDataSource.getRepository(ProjectLaunchEntity).remove(structuredClone(projectLaunch));
      return projectLaunch;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the project launch. The project launch with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async createInvestment(
    id: string,
    data: CreateProjectLaunchInvestmentDto,
  ): Promise<ProjectLaunchInvestmentEntity> {
    try {
      const projectLaunchInvestment = await AppDataSource.getRepository(
        ProjectLaunchInvestmentEntity,
      ).save({
        ...data,
        investor: { id: data.investorId },
        projectLaunch: { id },
      });

      const projectLaunch = await AppDataSource.getRepository(ProjectLaunchEntity).findOneOrFail({
        where: { id },
        relations: { projectLaunchInvestments: true, dao: { members: true } },
      });

      const fundraiseProgress = await AppDataSource.getRepository(
        ProjectLaunchInvestmentEntity,
      ).sum('amount', { projectLaunch: { id } });

      let projectLaunchUpdateData: any = {
        fundraiseProgress,
      };

      if ((fundraiseProgress ?? 0) >= projectLaunch.fundraiseAmount) {
        projectLaunchUpdateData = { ...projectLaunchUpdateData, isFundraised: true };
      }

      await AppDataSource.getRepository(ProjectLaunchEntity).update(
        { id },
        projectLaunchUpdateData,
      );

      if (!projectLaunch.dao?.members.find(member => member.id === data.investorId)) {
        const investor = await userService.findOne({ where: { id: data.investorId } });

        rabbitMQ.publish(
          'broker.request',
          {
            multisig_pda: projectLaunch.dao.multisigPda,
            pubkey: investor.walletId,
            permissions: [],
          },
          CommandType.AddMember,
        );

        projectLaunch.dao.members.push(investor);
        await AppDataSource.getRepository(DaoEntity).save(projectLaunch.dao);
      }

      return await AppDataSource.getRepository(ProjectLaunchInvestmentEntity).findOneOrFail({
        where: { id: projectLaunchInvestment.id },
        relations: { investor: true, projectLaunch: true },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot create project launch investment. The project launch with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async updateInvestment(
    id: string,
    investorId: string,
    data: UpdateProjectLaunchInvestmentDto,
  ): Promise<ProjectLaunchInvestmentEntity> {
    try {
      await AppDataSource.getRepository(ProjectLaunchInvestmentEntity).update(
        { projectLaunch: { id }, investor: { id: investorId } },
        data,
      );

      return await AppDataSource.getRepository(ProjectLaunchInvestmentEntity).findOneOrFail({
        relations: {
          investor: true,
          projectLaunch: true,
        },
        where: { projectLaunch: { id }, investor: { id: investorId } },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update project launch investment. The investment with such id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new ProjectLaunchService();
