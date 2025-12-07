import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { Column, Entity } from 'typeorm';

@Entity('cloud_session')
export class CloudSessionEntity {
  @Column({ nullable: false, primary: true })
  @Expose()
  id: string;

  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  data: string;

  @Column({ nullable: true })
  encryption: string;
}
