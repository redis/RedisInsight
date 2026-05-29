import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Expose } from 'class-transformer';

/**
 * @deprecated Custom tutorials are deprecated (RED-194229) and disabled by
 * default via the `customTutorials` feature flag. Slated for removal.
 */
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
