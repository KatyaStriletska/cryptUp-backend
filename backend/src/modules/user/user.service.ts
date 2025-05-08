import AppDataSource from '../../typeorm/index.typeorm';
import { CreateUserDto, UpdateUserDto } from '../../DTO/user.dto';
import { UserEntity } from '../../typeorm/entities/user.entity';
import {
  ConflictException,
  DatabaseException,
  NotFoundException,
} from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import passwordService from '../password/password.service';
import _ from 'lodash';

export class UserService {
  async findMany(options?: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
    try {
      return await AppDataSource.getRepository(UserEntity).find(
        _.merge(options, {
          relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<UserEntity>): Promise<UserEntity> {
    try {
      let removedAt = (options?.where as any)?.userToChats?.chat?.messages?.removedAt;
      delete (options?.where as any)?.userToChats?.chat?.messages?.removedAt;

      if (!removedAt) removedAt = null;

      const user = await AppDataSource.getRepository(UserEntity).findOneOrFail(
        _.merge(options, {
          relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        }),
      );

      if (user.userToChats) {
        user.userToChats = user.userToChats.map(userToChat => ({
          ...userToChat,
          chat: {
            ...userToChat.chat,
            messages: userToChat.chat.messages.filter(message => message.removedAt === removedAt),
          },
        }));
      }

      return user;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The user with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    try {
      const exists = await AppDataSource.getRepository(UserEntity).exists({
        where: [{ email: data.email, username: data.username, ...(data.walletId && { walletId: data.walletId }) }],
      });

      if (exists) {
        throw new ConflictException(
          'Cannot create a user. The record with such email or username or walletId already exists',
        );
      }

      return await AppDataSource.getRepository(UserEntity).save(data);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    try {
      if (data.walletId) {
        const userFromDb = await AppDataSource.getRepository(UserEntity).findOneOrFail({
          where: [{ id, }],
        });
        if (!userFromDb.walletId || userFromDb.walletId !== data.walletId) {
          const existsUserWithWallet = await AppDataSource.getRepository(UserEntity).exists({
            where: [{ walletId: data.walletId }],
          });

          if (existsUserWithWallet) {
            throw new ConflictException(
              'Cannot update a user. The specified wallet was already used by another user',
            );
          }
        }
      }


      if (data.password?.trim()) {
        data.password = await passwordService.hash(data.password);
      } else {
        delete data.password;
      }

      await AppDataSource.getRepository(UserEntity).update({ id }, data);

      return await AppDataSource.getRepository(UserEntity).findOneOrFail({
        relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the user. The user with provided id does not exist',
          error,
        );
      }
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }

  async remove(id: string): Promise<UserEntity> {
    try {
      const user = await AppDataSource.getRepository(UserEntity).findOneOrFail({
        relations: { projectLaunches: true, session: true, projectLaunchInvestments: true },
        where: { id },
      });

      await AppDataSource.getRepository(UserEntity).remove(structuredClone(user));

      return user;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the user. The user with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('InternalServerError', error);
    }
  }
}

export default new UserService();
