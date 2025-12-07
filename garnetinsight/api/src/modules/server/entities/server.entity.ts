import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('server')
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  @Expose()
  createDateTime: string;
}
