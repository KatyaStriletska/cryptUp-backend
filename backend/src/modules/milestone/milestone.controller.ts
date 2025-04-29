import { Request, Response } from 'express';
import milestoneService from './milestone.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';
import { CommandType } from '../../utils/dao.utils';
import authService from '../auth/auth.service';

@Controller()
export class MilestoneController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const milestones = await milestoneService.findMany({
      order: {
        createdAt: 'DESC',
      },
      ...query,
    });

    return response.status(HttpStatusCode.Ok).json(milestones);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const { id } = request.params as any;
    const milestone = await milestoneService.findOne(_.merge(query, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async create(request: Request, response: Response) {
    const milestone = await milestoneService.create(request.body);

    return response.status(HttpStatusCode.Created).json(milestone);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    const milestoneToFind = await milestoneService.findOne({
      where: { id },
      relations: {
        project: { projectLaunch: { author: true, dao: true, projectLaunchInvestments: true } },
      },
    });

    if (request.body.isFinal && request.session.user) {
      const authenticatedUser = await authService.getAuthenticatedUser(request.session.user.id);
      if (milestoneToFind.project.projectLaunch.projectLaunchInvestments) {
        await milestoneService.handleProposal(id, {
          commandType: CommandType.Withdraw,
          authorId: authenticatedUser.id,
          data: {
            multisig_pda: milestoneToFind.project.projectLaunch.dao.multisigPda,
            receiver: milestoneToFind.project.projectLaunch.author.walletId,
            is_execute: false,
            amount:
              Number(
                (
                  milestoneToFind.project.projectLaunch.projectLaunchInvestments.reduce(
                    (previousValue, currentValue) => previousValue + Number(currentValue.amount),
                    0,
                  ) / (milestoneToFind?.project?.milestoneNumber || 1)
                ).toFixed(6),
              ) * 1_000_000,
          },
        });
      }
    }

    const milestone = await milestoneService.update(id, request.body);
      return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await milestoneService.findOne({ where: { id } });
    const milestone = await milestoneService.remove(id);

    return response.status(HttpStatusCode.Ok).json(milestone);
  }

  async handleProposal(request: Request, response: Response) {
    const { id } = request.params;
    const { commandType, createNew } = request.body;

    if (Object.entries(CommandType).find(([_, value]) => value === commandType) && id) {
      const proposal = await milestoneService.handleProposal(id, request.body, createNew);
      return response.status(HttpStatusCode.Created).json(proposal);
    }

    return response
      .status(HttpStatusCode.Conflict)
      .json({ message: 'Invalid command type was provided', body: request.body });
  }
}

export default new MilestoneController();
