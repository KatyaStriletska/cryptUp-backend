import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import messageService from './message.service';
import { HttpStatusCode } from 'axios';
import _ from 'lodash';

@Controller()
export class MessageController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const messages = await messageService.findMany(query);

    return response.status(HttpStatusCode.Ok).json(messages);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params as any;
    const message = await messageService.findOne(_.merge(query as any, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(message);
  }

  async create(request: Request, response: Response) {
    const message = await messageService.create(request.body);

    return response.status(HttpStatusCode.Created).json(message);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    await messageService.findOne({ where: { id } });
    const message = await messageService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(message);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await messageService.findOne({ where: { id } });
    const message = await messageService.remove(id);

    return response.status(HttpStatusCode.Ok).json(message);
  }
}

export default new MessageController();
