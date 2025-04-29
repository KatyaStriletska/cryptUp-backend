import { CreateSessionDto, UpdateSessionDto } from '../../DTO/session.dto';
import { SessionEntity } from '../../typeorm/entities/session.entity';
import AppDataSource from '../../typeorm/index.typeorm';
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
} from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError, FindManyOptions } from 'typeorm';
import _ from 'lodash';

export class SessionService {
  async findMany(options?: FindManyOptions<SessionEntity>): Promise<SessionEntity[]> {
    try {
      return await AppDataSource.getRepository(SessionEntity).find(
        _.merge(options, {
          relations: { user: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindManyOptions<SessionEntity>): Promise<SessionEntity> {
    try {
      return await AppDataSource.getRepository(SessionEntity).findOneOrFail(
        _.merge(options, {
          relations: { user: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The session with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateSessionDto): Promise<SessionEntity> {
    try {
      const exists = await AppDataSource.getRepository(SessionEntity).exists({
        where: [{ sessionId: data.sessionId }, { user: { id: data.userId } }],
      });

      if (exists) {
        throw new ConflictException(
          'Cannot create the session. The record with provided sessionId and userId already exist',
        );
      }

      return await AppDataSource.getRepository(SessionEntity).save({
        sessionId: data.sessionId,
        user: { id: data.userId },
        expiresAt: data.expiresAt,
      });
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(sessionId: string, data: UpdateSessionDto): Promise<SessionEntity> {
    try {
      await AppDataSource.getRepository(SessionEntity).update({ sessionId }, data);

      return await AppDataSource.getRepository(SessionEntity).findOneOrFail({
        relations: { user: true },
        where: { sessionId: data.sessionId ? data.sessionId : sessionId },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the session. The session with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(sessionId: string): Promise<SessionEntity> {
    try {
      const session = await AppDataSource.getRepository(SessionEntity).findOneOrFail({
        relations: { user: true },
        where: { sessionId },
      });

      await AppDataSource.getRepository(SessionEntity).remove(structuredClone(session));
      return session;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the session. The session with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }
}

export default new SessionService();
