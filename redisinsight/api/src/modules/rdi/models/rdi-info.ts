import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RdiInfo {
  @ApiProperty({
    description: 'Current RDI collector version',
    type: String,
  })
  @Expose()
  version: string;
}
