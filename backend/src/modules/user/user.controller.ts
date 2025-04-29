import { Request, Response } from 'express';
import userService from './user.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';
import pinata from '../../utils/file.utils';
import { Readable } from 'stream';

@Controller()
export class UserController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const users = await userService.findMany(query);

    return response.status(HttpStatusCode.Ok).json(users);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params;
    const user = await userService.findOne(_.merge(query, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(user);
  }

  async create(request: Request, response: Response) {
    const user = await userService.create(request.body);

    return response.status(HttpStatusCode.Created).json(user);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    const { avatar: currentAvatar } = await userService.findOne({ where: { id } });

    let files: Express.Multer.File[] = [];
    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const avatarFile = files.find(file => file.fieldname === 'user-avatar');

    if (currentAvatar && avatarFile !== undefined) {
      pinata.unpin(currentAvatar).catch(console.log);
    }

    const avatar = avatarFile
      ? (
          await pinata.pinFileToIPFS(Readable.from(avatarFile.buffer), {
            pinataMetadata: { name: avatarFile.originalname },
          })
        ).IpfsHash
      : null;

    const data = {
      ...request.body,
      avatar: avatar ? avatar : request.body.avatar === '' ? null : currentAvatar,
    };

    const user = await userService.update(id, data);

    return response.status(HttpStatusCode.Ok).json(user);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await userService.findOne({ where: { id } });
    const user = await userService.remove(id);

    if (user.avatar) {
      pinata.unpin(user.avatar).catch(console.log);
    }

    return response.status(HttpStatusCode.Ok).json(user);
  }
}

export default new UserController();
