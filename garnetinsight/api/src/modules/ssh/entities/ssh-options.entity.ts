import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('ssh_options')
export class SshOptionsEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  host: string;

  @Expose()
  @Column({ nullable: false })
  port: number;

  @Expose()
  @Column({ nullable: true })
  encryption: string;

  @Expose()
  @Column({ nullable: true })
  username: string;

  @Expose()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ nullable: true })
  privateKey: string;

  @Expose()
  @Column({ nullable: true })
  passphrase: string;

  @OneToOne(() => DatabaseEntity, (database) => database.sshOptions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  database: DatabaseEntity;
}
