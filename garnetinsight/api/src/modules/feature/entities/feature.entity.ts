import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('features')
export class FeatureEntity {
  @Expose()
  @PrimaryColumn()
  name: string;

  @Expose()
  @Column()
  flag: boolean;

  @Expose()
  @Column({ nullable: true })
  strategy?: string;

  @Expose()
  @Column({ nullable: true, type: 'text' })
  @DataAsJsonString()
  data?: string;
}
