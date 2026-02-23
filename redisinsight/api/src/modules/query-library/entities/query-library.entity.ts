import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { Expose } from 'class-transformer';
import { QueryLibraryType } from 'src/modules/query-library/models/query-library-type.enum';

@Entity('query_library')
@Index('IDX_query_library_db_index_created', [
  'databaseId',
  'indexName',
  'createdAt',
])
export class QueryLibraryEntity {
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

  @Column({ nullable: false })
  @Expose()
  indexName: string;

  @Column({ nullable: false, default: QueryLibraryType.Saved })
  @Expose()
  type: string;

  @Column({ nullable: false })
  @Expose()
  name: string;

  @Column({ nullable: true, type: 'text' })
  @Expose()
  description?: string;

  @Column({ nullable: false, type: 'text' })
  @Expose()
  query: string;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
