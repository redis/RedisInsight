import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { Expose } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'src/modules/workbench/models/command-execution';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('command_execution')
export class CommandExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: false })
  @Expose()
  databaseId: string;

  @ManyToOne(() => DatabaseEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'databaseId' })
  @Expose()
  database: DatabaseEntity;

  @Column({ nullable: false, type: 'text' })
  @Expose()
  command: string;

  @Column({ nullable: true })
  @Expose()
  mode?: string = RunQueryMode.ASCII;

  @Column({ nullable: false, type: 'text' })
  @DataAsJsonString()
  @Expose()
  result: string;

  @Column({ nullable: true })
  @Expose()
  role?: string;

  @Column({ nullable: true })
  @Expose()
  resultsMode?: string = ResultsMode.Default;

  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  summary?: string;

  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  nodeOptions?: string;

  @Column({ nullable: true })
  encryption: string;

  @Column({ nullable: true })
  @Expose()
  executionTime?: number;

  @Column({ nullable: true })
  @Expose()
  @IsInt()
  @Min(0)
  db?: number;

  @Column({ nullable: false, default: CommandExecutionType.Workbench })
  @Expose()
  type?: string = CommandExecutionType.Workbench;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;
}
