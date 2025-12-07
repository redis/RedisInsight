import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('custom_tutorials')
export class CustomTutorialEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: false })
  @Expose()
  name: string;

  @Column({ nullable: true })
  @Expose()
  link?: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;
}
