import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { MessageEntity } from '../../typeorm/entities/message.entity';
import AppDataSource from '../../typeorm/index.typeorm';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import _, { entries } from 'lodash';
import { CreateMessageDto, UpdateMessageDto } from '../../DTO/message.dto';
import { UserEntity } from '../../typeorm/entities/user.entity';

export class MessageService {
  async findMany(options?: FindManyOptions<MessageEntity>): Promise<MessageEntity[]> {
    try {
      return await AppDataSource.getRepository(MessageEntity).find(
        _.merge(options, {
          relations: { author: true, replies: true, seenBy: true, replyTo: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<MessageEntity>): Promise<MessageEntity> {
    try {
      return await AppDataSource.getRepository(MessageEntity).findOneOrFail(
        _.merge(options, {
          relations: { author: true, replies: true, seenBy: true, replyTo: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The message with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateMessageDto): Promise<MessageEntity> {
    try {
      const message = await AppDataSource.getRepository(MessageEntity).save(data);

      return await AppDataSource.getRepository(MessageEntity).findOneOrFail({
        where: { id: message.id },
        relations: {
          author: true,
          replies: true,
          seenBy: true,
          replyTo: { author: true },
          chat: true,
        },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateMessageDto): Promise<MessageEntity> {
    try {
      const { seenBy, ...rest } = data;

      if (rest.isPinned) {
        rest.isPinned = Boolean(rest.isPinned);
      }

      if (data.content !== undefined || Object.entries(rest).length > 0) {
        await AppDataSource.getRepository(MessageEntity).update(
          { id },
          { ...(data.content !== undefined && { updatedAt: new Date() }), ...rest },
        );
      }

      const message = await AppDataSource.getRepository(MessageEntity).findOneOrFail({
        relations: {
          author: true,
          replies: true,
          seenBy: true,
          replyTo: { author: true },
          chat: true,
        },
        where: { id },
      });

      if (seenBy) {
        const seenByUser = await AppDataSource.getRepository(UserEntity).findOne({
          where: { id: seenBy },
        });

        if (seenByUser && !message.seenBy.find(user => user.id === seenByUser.id)) {
          message.seenBy.push(seenByUser);
          await AppDataSource.getRepository(MessageEntity).save(message);
        }
      }

      return message;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the message. The message with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<MessageEntity> {
    try {
      const message = await AppDataSource.getRepository(MessageEntity).findOneOrFail({
        relations: {
          author: true,
          replies: true,
          seenBy: true,
          replyTo: { author: true },
          chat: true,
        },
        where: { id },
      });

      await AppDataSource.getRepository(MessageEntity).remove(structuredClone(message));

      return message;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the message. The message with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new MessageService();
