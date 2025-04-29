import { Request, Response } from 'express';
import dataAccountService from './data-account.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';

@Controller()
export class DataAccountController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const dataAccounts = await dataAccountService.findMany(query);

    return response.status(HttpStatusCode.Ok).json(dataAccounts);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const { id } = request.params as any;
    const dataAccount = await dataAccountService.findOne(_.merge(query, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  }

  async create(request: Request, response: Response) {
    const dataAccount = await dataAccountService.create(request.body);

    return response.status(HttpStatusCode.Created).json(dataAccount);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await dataAccountService.findOne({ where: { id } });
    const dataAccount = await dataAccountService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await dataAccountService.findOne({ where: { id } });
    const dataAccount = await dataAccountService.remove(id);

    return response.status(HttpStatusCode.Ok).json(dataAccount);
  }
}

export default new DataAccountController();
