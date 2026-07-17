import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsObject } from 'class-validator';

export class RunSummaryViewPartitionDto {
  @ApiProperty({
    description:
      'Partition group keys. Must exactly match the group_by keys the ' +
      'summary view was created with (e.g. { user_id: "u1" })',
    type: Object,
  })
  @Expose()
  @IsObject()
  @IsNotEmpty()
  group: Record<string, string>;
}
