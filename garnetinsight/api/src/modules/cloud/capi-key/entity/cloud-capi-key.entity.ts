import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('cloud_capi_key')
@Unique(['userId', 'cloudAccountId', 'cloudUserId'])
export class CloudCapiKeyEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  userId: string;

  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({ nullable: false })
  cloudAccountId: number;

  @Expose()
  @Column({ nullable: false })
  cloudUserId: number;

  @Expose()
  @Column({ nullable: true })
  capiKey: string;

  @Expose()
  @Column({ nullable: true })
  capiSecret: string;

  @Expose()
  @Column({ nullable: true, default: true })
  valid: boolean;

  @Column({ nullable: true })
  encryption: string;

  @Expose()
  @Column({ type: 'datetime', nullable: true })
  createdAt: Date;

  @Expose()
  @Column({ type: 'datetime', nullable: true })
  lastUsed: Date;
}
