import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RdiDryRunJobDto {
  @ApiProperty({
    description: 'Input data',
    type: Object,
  })
  @Expose()
  @IsNotEmpty()
  input_data: object;

  @ApiProperty({
    description: 'Job file',
    type: Object,
  })
  @Expose()
  @IsNotEmpty()
  job: object;
}
