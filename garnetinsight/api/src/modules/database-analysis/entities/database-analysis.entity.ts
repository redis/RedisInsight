import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsInt, Min } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('database_analysis')
export class DatabaseAnalysisEntity {
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

  @Column({ nullable: false })
  @Expose()
  delimiter: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  progress: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  totalKeys: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  totalMemory: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform(({ value }) => JSON.stringify(value), { toClassOnly: true })
  @Transform(
    ({ value: str }) => {
      try {
        return JSON.parse(str).map((value) => ({
          ...value,
          nsp: Buffer.from(value.nsp),
        }));
      } catch (e) {
        return undefined;
      }
    },
    { toPlainOnly: true },
  )
  @Expose()
  topKeysNsp: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform(({ value }) => JSON.stringify(value), { toClassOnly: true })
  @Transform(
    ({ value: str }) => {
      try {
        return JSON.parse(str).map((value) => ({
          ...value,
          nsp: Buffer.from(value.nsp),
        }));
      } catch (e) {
        return undefined;
      }
    },
    { toPlainOnly: true },
  )
  @Expose()
  topMemoryNsp: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform(({ value }) => JSON.stringify(value), { toClassOnly: true })
  @Transform(
    ({ value: str }) => {
      try {
        return JSON.parse(str).map((value) => ({
          ...value,
          name: Buffer.from(value.name),
        }));
      } catch (e) {
        return undefined;
      }
    },
    { toPlainOnly: true },
  )
  @Expose()
  topKeysLength: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform(({ value }) => JSON.stringify(value), { toClassOnly: true })
  @Transform(
    ({ value: str }) => {
      try {
        return JSON.parse(str).map((value) => ({
          ...value,
          name: Buffer.from(value.name),
        }));
      } catch (e) {
        return undefined;
      }
    },
    { toPlainOnly: true },
  )
  @Expose()
  topKeysMemory: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  expirationGroups: string;

  @Column({ nullable: true })
  encryption: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  recommendations: string;

  @Column({ nullable: true })
  @Expose()
  @IsInt()
  @Min(0)
  db?: number;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;

  constructor(entity: Partial<DatabaseAnalysisEntity>) {
    Object.assign(this, entity);
  }
}
