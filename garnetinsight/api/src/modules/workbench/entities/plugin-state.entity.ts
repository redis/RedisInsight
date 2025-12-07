import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('plugin_state')
export class PluginStateEntity {
  @PrimaryColumn()
  @Expose()
  commandExecutionId: string;

  @ManyToOne(() => CommandExecutionEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commandExecutionId' })
  commandExecution: CommandExecutionEntity;

  @PrimaryColumn()
  @Expose()
  visualizationId: string;

  @Column({ nullable: false, type: 'text' })
  @DataAsJsonString()
  @Expose()
  state: string;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  constructor(entity: Partial<PluginStateEntity>) {
    Object.assign(this, entity);
  }
}
