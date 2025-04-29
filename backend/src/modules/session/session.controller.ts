import { Request, Response } from 'express';
import sessionService from './session.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';

@Controller()
export class SessionController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const sessions = await sessionService.findMany(query);

    return response.status(HttpStatusCode.Ok).json(sessions);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const { id } = request.params as any;
    const session = await sessionService.findOne(_.merge(query, { where: { sessionId: id } }));

    return response.status(HttpStatusCode.Ok).json(session);
  }

  async create(request: Request, response: Response) {
    const session = await sessionService.create(request.body);

    return response.status(HttpStatusCode.Created).json(session);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await sessionService.findOne({ where: { sessionId: id } });
    const session = await sessionService.update(id, request.body);

    return response.status(HttpStatusCode.Ok).json(session);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await sessionService.findOne({ where: { sessionId: id } });
    const session = await sessionService.remove(id);

    return response.status(HttpStatusCode.Ok).json(session);
  }
}

export default new SessionController();
