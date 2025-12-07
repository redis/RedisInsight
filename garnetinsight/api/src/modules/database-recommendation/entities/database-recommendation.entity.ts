import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('database_recommendations')
@Unique(['databaseId', 'name'])
export class DatabaseRecommendationEntity {
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

  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({ nullable: false, default: false })
  read?: boolean = false;

  @Expose()
  @Column({ nullable: false, default: false })
  disabled?: boolean = false;

  @Expose()
  @Column({
    nullable: true,
  })
  vote?: string;

  @Expose()
  @Column({ nullable: false, default: false })
  hide?: boolean = false;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  params?: string;

  @Column({ nullable: true })
  encryption: string;

  constructor(entity: Partial<DatabaseRecommendationEntity>) {
    Object.assign(this, entity);
  }
}
