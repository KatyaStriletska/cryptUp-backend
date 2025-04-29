import AppDataSource from '../../typeorm/index.typeorm';
import { CreateDataAccountDto, UpdateDataAccountDto } from '../../DTO/data-account.dto';
import { DataAccountEntity } from '../../typeorm/entities/data-account.entity';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import _ from 'lodash';

export class DataAccountService {
  async findMany(options?: FindManyOptions<DataAccountEntity>): Promise<DataAccountEntity[]> {
    try {
      return await AppDataSource.getRepository(DataAccountEntity).find(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<DataAccountEntity>): Promise<DataAccountEntity> {
    try {
      return await AppDataSource.getRepository(DataAccountEntity).findOneOrFail(
        _.merge(options, {
          relations: { project: true },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The data account with provided params does not exist', error);
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateDataAccountDto): Promise<DataAccountEntity> {
    try {
      return await AppDataSource.getRepository(DataAccountEntity).save({
        ...data,
        project: { id: data.projectId },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateDataAccountDto): Promise<DataAccountEntity> {
    try {
      await AppDataSource.getRepository(DataAccountEntity).update({ id }, data);

      return await AppDataSource.getRepository(DataAccountEntity).findOneOrFail({
        relations: { project: true },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update data account. The data account with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<DataAccountEntity> {
    try {
      const dataAccount = await AppDataSource.getRepository(DataAccountEntity).findOneOrFail({
        relations: { project: true },
        where: { id },
      });

      await AppDataSource.getRepository(DataAccountEntity).remove(structuredClone(dataAccount));
      return dataAccount;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove data account. The data account with provided id does not exist',
          error,
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new DataAccountService();
