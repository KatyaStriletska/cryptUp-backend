import qs from 'qs';
import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import proposalService from './proposal.service';
import { HttpStatusCode } from 'axios';
import _ from 'lodash';

@Controller()
export class ProposalController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const proposals = await proposalService.findMany(query);

    return response.status(HttpStatusCode.Ok).json(proposals);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params as any;
    const proposal = await proposalService.findOne(_.merge(query as any, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(proposal);
  }

  async create(request: Request, response: Response) {
    const proposal = await proposalService.create(request.body);

    return response.status(HttpStatusCode.Created).json(proposal);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    await proposalService.findOne({ where: { id } });
    const proposal = await proposalService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(proposal);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await proposalService.findOne({ where: { id } });
    const proposal = await proposalService.remove(id);

    return response.status(HttpStatusCode.Ok).json(proposal);
  }
}

export default new ProposalController();
