import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteDatabasesDto {
  @ApiProperty({
    description: 'The unique ID of the database requested',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  ids: string[];
}
