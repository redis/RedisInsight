import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Applied settings by user.',
    type: String,
  })
  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  data: string;
}
