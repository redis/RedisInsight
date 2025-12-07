import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { BrowserHistoryMode } from 'src/common/constants';

@Entity('browser_history')
export class BrowserHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: false })
  @Index()
  @Expose()
  databaseId: string;

  @ManyToOne(() => DatabaseEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseEntity;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  filter: string;

  @Column({ nullable: true })
  @Expose()
  mode?: string = BrowserHistoryMode.Pattern;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;

  constructor(entity: Partial<BrowserHistoryEntity>) {
    Object.assign(this, entity);
  }
}
