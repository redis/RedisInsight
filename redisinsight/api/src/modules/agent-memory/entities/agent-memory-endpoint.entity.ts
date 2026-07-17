import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('agent_memory_endpoint')
export class AgentMemoryEndpointEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({ nullable: false })
  url: string;

  @Expose()
  @Column({ nullable: false, default: 'oss' })
  backendType: string;

  @Expose()
  @Column({ nullable: true })
  storeId: string;

  @Expose({ groups: ['security'] })
  @Column({ nullable: true })
  apiKey: string;

  @Expose()
  @Column({ type: 'datetime', nullable: true })
  lastConnection: Date;

  @Column({ nullable: true })
  encryption: string;
}
