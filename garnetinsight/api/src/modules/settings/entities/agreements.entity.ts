import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('agreements')
export class AgreementsEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Last accepted version.',
    type: String,
  })
  @Column({ nullable: true })
  @Expose()
  version: string;

  @ApiProperty({
    description: 'User agreements.',
    type: String,
  })
  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  data: string;
}
