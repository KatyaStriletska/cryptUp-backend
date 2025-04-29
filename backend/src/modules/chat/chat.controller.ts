import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import chatService from './chat.service';
import { HttpStatusCode } from 'axios';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import path from 'path';
import pinata from '../../utils/file.utils';
import { Readable } from 'stream';

@Controller()
export class ChatController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const chats = await chatService.findMany({
      order: {
        messages: {
          createdAt: 'DESC',
        },
      },
      ...query,
    });

    return response.status(HttpStatusCode.Ok).json(chats);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params as any;
    const chat = await chatService.findOne(
      _.merge(query as any, { where: { id }, order: { messages: { createdAt: 'DESC' } } }),
    );

    return response.status(HttpStatusCode.Ok).json(chat);
  }

  async create(request: Request, response: Response) {
    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const createdChat = await chatService.create(request.body);
    const imageFile = files.find(file => file.fieldname === 'chat-image') ?? null;

    const image = imageFile
      ? (
          await pinata.pinFileToIPFS(Readable.from(imageFile.buffer), {
            pinataMetadata: { name: imageFile.originalname },
          })
        ).IpfsHash
      : null;

    const chat = await chatService.update(createdChat.id, {
      image: image || null,
    });

    return response.status(HttpStatusCode.Created).json(chat);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const chatToUpdate = await chatService.findOne({ where: { id } });

    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const imageFile = files.find(file => file.fieldname === 'chat-image');

    if (chatToUpdate.image && imageFile !== undefined) {
      pinata.unpin(chatToUpdate.image).catch(console.log);
    }

    const image = imageFile
      ? (
          await pinata.pinFileToIPFS(Readable.from(imageFile.buffer), {
            pinataMetadata: { name: imageFile.originalname },
          })
        ).IpfsHash
      : null;

    delete request.body['chat-image'];

    const data = {
      ...request.body,
      image: image || null,
    };

    const chat = await chatService.update(id, data);

    return response.status(HttpStatusCode.Ok).json(chat);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await chatService.findOne({ where: { id } });
    const chat = await chatService.remove(id);

    if (chat.image) {
      pinata.unpin(chat.image);
    }

    return response.status(HttpStatusCode.Ok).json(chat);
  }
}

export default new ChatController();
