import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { HttpStatusCode } from 'axios';
import daoService from './dao.service';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';

@Controller()
export class DAOController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const daos = await daoService.findMany(query);

    return response.status(HttpStatusCode.Ok).json(daos);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params as any;
    const dao = await daoService.findOne(_.merge(query as any, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(dao);
  }

  async create(request: Request, response: Response) {
    const dao = await daoService.create(request.body);

    return response.status(HttpStatusCode.Created).json(dao);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    await daoService.findOne({ where: { id } });
    const dao = await daoService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(dao);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await daoService.findOne({ where: { id } });
    const dao = await daoService.remove(id);

    return response.status(HttpStatusCode.Ok).json(dao);
  }

  async withdraw(request: Request, response: Response) {
    await daoService.withdraw(request.body);
    return response.status(HttpStatusCode.Ok).json('received');
  }

  async executeProposal(request: Request, response: Response) {
    await daoService.executeProposal(request.body);
    return response.status(HttpStatusCode.Ok).json('proposed');
  }

  async vote(request: Request, response: Response) {
    await daoService.vote(request.body);
    return response.status(HttpStatusCode.Ok).json('voted');
  }

  async changeThreshold(request: Request, response: Response) {
    await daoService.changeThreshold(request.body);
    return response.status(HttpStatusCode.Ok).json('threshold changed');
  }
}

export default new DAOController();
