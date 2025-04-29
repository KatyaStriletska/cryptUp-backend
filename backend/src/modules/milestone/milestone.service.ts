import AppDataSource from '../../typeorm/index.typeorm';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../../DTO/milestone.dto';
import { MilestoneEntity } from '../../typeorm/entities/milestone.entity';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { DatabaseException, MintNftException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _ from 'lodash';
import { CommandType } from '../../utils/dao.utils';
import { ProposalEntity } from '../../typeorm/entities/proposal.entity';
import proposalService from '../proposal/proposal.service';
import { rabbitMQ } from '../../utils/rabbitmq.utils';
import { ProposalStatusEnum } from '../../types/enums/proposal-status.enum';
import nftMintService from '../nft/nft.service';
import { ProjectEntity } from '../../typeorm/entities/project.entity';
import { UserEntity } from '../../typeorm/entities/user.entity';

export class MilestoneService {
  async findMany(options?: FindManyOptions<MilestoneEntity>): Promise<MilestoneEntity[]> {
    try {
      return await AppDataSource.getRepository(MilestoneEntity).find(
        _.merge(options, {
          relations: { project: true, proposals: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<MilestoneEntity>): Promise<MilestoneEntity> {
    try {
      return await AppDataSource.getRepository(MilestoneEntity).findOneOrFail(
        _.merge(options, {
          relations: { proposals: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The milestone with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateMilestoneDto): Promise<MilestoneEntity> {
    try {
      return await AppDataSource.getRepository(MilestoneEntity).save({
        ...data,
        project: { id: data.projectId },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateMilestoneDto): Promise<MilestoneEntity> {
    try {
      await AppDataSource.getRepository(MilestoneEntity).update({ id }, data);

      if (data.isFinal) {
        await this.getProjectLaunchIvests(id); //TODO: change name
      }

      return await AppDataSource.getRepository(MilestoneEntity).findOneOrFail({
        relations: { project: true, proposals: true },
        where: { id },
      });

    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the milestone. The milestone with provided id does not exist',
        );
      }
      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<MilestoneEntity> {
    try {
      const milestone = await AppDataSource.getRepository(MilestoneEntity).findOneOrFail({
        relations: { project: true, proposals: true },
        where: { id },
      });

      await AppDataSource.getRepository(MilestoneEntity).remove(structuredClone(milestone));

      return milestone;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the milestone. The milestone with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async handleProposal(
    milestoneId: string,
    dto: { commandType: CommandType; authorId: string; data: any },
    createNew: boolean = true,
  ): Promise<ProposalEntity> {
    const milestone = await this.findOne({ where: { id: milestoneId } });

    const proposal = createNew
      ? await proposalService.create({
        milestone: { id: milestoneId },
        description: milestone.description,
        type: dto.commandType,
        author: { id: dto.authorId },
      })
      : (
        await proposalService.findMany({
          where: { milestone: { id: milestoneId } },
          order: { createdAt: 'DESC' },
        })
      ).find(proposal => proposal)!;

    if (!createNew) {
      await proposalService.update(proposal.id, { status: ProposalStatusEnum.Executing });
    }

    console.log({ ...dto.data, proposal_id: proposal.id });

    rabbitMQ.publish(
      'broker.request',
      { ...dto.data, proposal_id: proposal.id },
      dto.commandType,
    );

    return proposal;
  }
  private async getProjectLaunchIvests(id: string) {

    let projects = await AppDataSource.getRepository(ProjectEntity).findOneOrFail({
      where: {
        milestones: {
          id: id
        },
      },
      relations: { projectLaunch: { projectLaunchInvestments: { investor: true } } },
    });
    const projectLaunchInvestments = projects.projectLaunch.projectLaunchInvestments;
    const projectName = projects.projectLaunchName;
    if (!projectLaunchInvestments || projectLaunchInvestments.length === 0) {
      console.log("No investments found for this project launch.");
      throw new MintNftException('No investments found for this project launch.');
    }
    const fundraiseAmount = projects.projectLaunch.fundraiseAmount;
    console.log("Project Launch Investment: ", fundraiseAmount);
    console.log("Investments: ", projectLaunchInvestments);
    console.log("Projects : ", projects);
    console.log("projectName: ", projectName);
    await nftMintService.countAmountForMInt(projectLaunchInvestments, fundraiseAmount, projectName, id);


  }
}

export default new MilestoneService();
