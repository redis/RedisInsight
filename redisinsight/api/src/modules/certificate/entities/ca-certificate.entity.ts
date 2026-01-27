import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { Expose } from 'class-transformer';

@Entity('ca_certificate')
export class CaCertificateEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  encryption: string;

  @Expose()
  @Column({ nullable: true })
  certificate: string;

  @Expose()
  @Column({ nullable: true })
  certificatePath: string;

  @Expose()
  @Column({ nullable: true })
  isPreSetup: boolean;

  @OneToMany(() => DatabaseEntity, (database) => database.caCert)
  databases: DatabaseEntity[];
}
