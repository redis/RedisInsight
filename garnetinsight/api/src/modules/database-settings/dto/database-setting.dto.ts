/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateOrUpdateDatabaseSettingDto {
  @ApiProperty({
    description: 'Applied settings by user, by database',
  })
  @Expose()
  data: Record<string, number | string | boolean>;
}
