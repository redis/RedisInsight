import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('features_config')
export class FeaturesConfigEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'float' })
  @Expose()
  controlNumber: number;

  @Column({ nullable: false })
  @Expose()
  @DataAsJsonString()
  data: string;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
