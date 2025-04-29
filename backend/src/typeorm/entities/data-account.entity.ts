import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { DataAccount } from '../../types/data-account.interface';
import { Project } from '../../types/project.interface';

@Entity('data_account')
export class DataAccountEntity implements DataAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  accountHash: string;

  @OneToOne(() => ProjectEntity, project => project.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId', referencedColumnName: 'id' })
  project: Project;
}
