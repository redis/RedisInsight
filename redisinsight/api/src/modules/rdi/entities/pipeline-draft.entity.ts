import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { RdiEntity } from 'src/modules/rdi/entities/rdi.entity';

@Entity('pipeline_draft')
export class PipelineDraftEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  rdiInstanceId: string;

  @ManyToOne(() => RdiEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rdiInstanceId' })
  rdiInstance?: RdiEntity;

  @Column({ nullable: false, type: 'text' })
  @DataAsJsonString()
  @Expose()
  data: string;

  @Column({ nullable: true })
  encryption?: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;
}
