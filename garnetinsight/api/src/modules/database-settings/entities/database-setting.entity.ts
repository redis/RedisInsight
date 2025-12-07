/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DataAsJsonString } from 'src/common/decorators';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('database_settings')
export class DatabaseSettingsEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ nullable: false })
  @Index({ unique: true })
  @Expose()
  databaseId: string;

  @OneToOne(() => DatabaseEntity, (database) => database.dbSettings, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  database: DatabaseEntity;

  @ApiProperty({
    description: 'Applied settings by user, by database',
  })
  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  data: string;

  constructor(entity: Partial<DatabaseSettingsEntity>) {
    Object.assign(this, entity);
  }
}
