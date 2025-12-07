import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('tag')
@Unique(['key', 'value'])
export class TagEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  key: string;

  @Expose()
  @Column()
  value: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Expose({ groups: ['security'] })
  encryption: string;

  @Expose()
  @ManyToMany(() => DatabaseEntity, (database) => database.tags, {
    onDelete: 'CASCADE',
  })
  databases: DatabaseEntity[];
}
